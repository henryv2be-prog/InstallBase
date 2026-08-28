"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth, signIn } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { getUploadDir, uploadPublicPath } from "@/lib/uploads";
import { getOrCreateConversation } from "@/lib/queries";
import { notifyUser } from "@/lib/notify";
import { sendPushToUser } from "@/lib/push";
import { isPushConfigured } from "@/lib/vapid";
import type { PostType, ExperienceLevel } from "@/generated/prisma/client";

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function calculateReputationLevel(score: number) {
  if (score >= 5000) return "MASTER";
  if (score >= 3000) return "EXPERT";
  if (score >= 1500) return "PRO";
  if (score >= 500) return "EXPERIENCED";
  if (score >= 100) return "INSTALLER";
  return "APPRENTICE";
}

export async function registerUser(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim();
  const password = formData.get("password") as string | null;
  const name = (formData.get("name") as string | null)?.trim();
  const username = (formData.get("username") as string | null)?.trim().toLowerCase();
  const city = (formData.get("city") as string | null)?.trim();
  const country = (formData.get("country") as string | null)?.trim();
  const experience = formData.get("experience") as ExperienceLevel | null;
  const specialties = formData.getAll("specialties") as string[];

  if (!email || !password || !name || !username || !city || !country || !experience) {
    return { error: "Please fill in all required fields" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return { error: "Username can only contain lowercase letters, numbers, and underscores" };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { profile: { username } }] },
  });
  if (existing) return { error: "Email or username already exists" };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      profile: {
        create: {
          username,
          city,
          country,
          experienceLevel: experience,
          specialties,
        },
      },
      reputation: { create: { score: 0 } },
    },
  });

  await signIn("credentials", { email, password, redirect: false });
  return { success: true, userId: user.id };
}

export async function createPost(formData: FormData) {
  const userId = await getCurrentUserId();
  const type = formData.get("type") as PostType;
  const content = ((formData.get("content") as string) || "").trim();
  const title = formData.get("title") as string | null;
  const location = formData.get("location") as string | null;
  const mediaUrls = formData.getAll("mediaUrls") as string[];
  if (!content && mediaUrls.filter(Boolean).length === 0) {
    return { error: "Add a photo or write something first" };
  }
  const tagNames = formData.getAll("tags") as string[];
  const productIds = formData.getAll("productIds") as string[];
  const bragDetailsRaw = formData.get("bragDetails") as string | null;

  let bragDetails = null;
  if (bragDetailsRaw) {
    try {
      bragDetails = JSON.parse(bragDetailsRaw);
    } catch {
      bragDetails = null;
    }
  }

  const post = await prisma.post.create({
    data: {
      authorId: userId,
      type,
      content,
      title: title || undefined,
      location: location || undefined,
      bragDetails: bragDetails ?? undefined,
      bragScore: type === "BRAG" ? 0 : undefined,
      media: {
        create: mediaUrls.filter(Boolean).map((url, i) => ({
          url,
          order: i,
          type: /\.(mp4|webm|mov)(\?|$)/i.test(url) ? "video" : "image",
        })),
      },
      products: {
        create: productIds.filter(Boolean).map((productId) => ({ productId })),
      },
    },
  });

  for (const tagName of tagNames.filter(Boolean)) {
    const slug = slugify(tagName);
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name: tagName, slug },
      update: {},
    });
    await prisma.postTag.create({ data: { postId: post.id, tagId: tag.id } });
  }

  if (type === "BRAG") {
    await prisma.profile.update({
      where: { userId },
      data: { bragCount: { increment: 1 } },
    });
  }

  revalidatePath("/feed");
  revalidatePath("/brags");
  revalidatePath("/questions");
  return { success: true, postId: post.id };
}

export async function toggleLike(postId: string) {
  const userId = await getCurrentUserId();
  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { postId, userId } });
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.authorId !== userId) {
      await notifyUser({
        userId: post.authorId,
        actorId: userId,
        type: "LIKE",
        message: "liked your post",
        link: `/post/${postId}`,
      });
      await prisma.reputation.update({
        where: { userId: post.authorId },
        data: { likesReceived: { increment: 1 }, score: { increment: 2 } },
      });
    }
  }

  revalidatePath("/feed");
  return { success: true };
}

export async function toggleBookmark(postId: string) {
  const userId = await getCurrentUserId();
  const existing = await prisma.bookmark.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({ data: { postId, userId } });
  }

  revalidatePath("/feed");
  return { success: true };
}

export async function toggleBragPoint(postId: string) {
  const userId = await getCurrentUserId();
  const existing = await prisma.bragPoint.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.bragPoint.delete({ where: { id: existing.id } });
    await prisma.post.update({
      where: { id: postId },
      data: { bragScore: { decrement: 1 } },
    });
  } else {
    await prisma.bragPoint.create({ data: { postId, userId } });
    await prisma.post.update({
      where: { id: postId },
      data: { bragScore: { increment: 1 } },
    });
  }

  revalidatePath("/feed");
  revalidatePath("/brags");
  return { success: true };
}

export async function addComment(postId: string, content: string) {
  const userId = await getCurrentUserId();
  await prisma.comment.create({
    data: { postId, authorId: userId, content },
  });

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post && post.authorId !== userId) {
    await notifyUser({
      userId: post.authorId,
      actorId: userId,
      type: "COMMENT",
      message: "commented on your post",
      link: `/post/${postId}`,
    });
  }

  revalidatePath("/feed");
  revalidatePath(`/post/${postId}`);
  return { success: true };
}

export async function toggleFollow(userId: string) {
  const currentUserId = await getCurrentUserId();
  if (currentUserId === userId) throw new Error("Cannot follow yourself");

  const [existing, target, me] = await Promise.all([
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: userId } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { select: { username: true } } },
    }),
    prisma.user.findUnique({
      where: { id: currentUserId },
      include: { profile: { select: { username: true } } },
    }),
  ]);

  if (!target) throw new Error("User not found");

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({
      data: { followerId: currentUserId, followingId: userId },
    });
    await notifyUser({
      userId,
      actorId: currentUserId,
      type: "FOLLOW",
      message: "started following you",
      link: me?.profile?.username ? `/profile/${me.profile.username}` : "/feed",
    });
  }

  revalidatePath("/feed");
  revalidatePath("/discover");
  revalidatePath("/notifications");
  if (target.profile?.username) {
    revalidatePath(`/profile/${target.profile.username}`);
    revalidatePath(`/profile/${target.profile.username}/follows`);
  }
  if (me?.profile?.username) {
    revalidatePath(`/profile/${me.profile.username}`);
    revalidatePath(`/profile/${me.profile.username}/follows`);
  }

  return { success: true, following: !existing };
}

export async function addAnswer(postId: string, content: string) {
  const userId = await getCurrentUserId();
  await prisma.answer.create({
    data: { postId, authorId: userId, content },
  });

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post && post.authorId !== userId) {
    await notifyUser({
      userId: post.authorId,
      actorId: userId,
      type: "ANSWER",
      message: "answered your question",
      link: `/post/${postId}`,
    });
  }

  revalidatePath(`/post/${postId}`);
  revalidatePath("/questions");
  return { success: true };
}

export async function markSolution(answerId: string, postId: string) {
  const userId = await getCurrentUserId();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== userId) throw new Error("Unauthorized");

  await prisma.answer.updateMany({
    where: { postId },
    data: { isSolution: false },
  });
  await prisma.answer.update({
    where: { id: answerId },
    data: { isSolution: true },
  });
  await prisma.post.update({
    where: { id: postId },
    data: { solved: true },
  });

  const answer = await prisma.answer.findUnique({ where: { id: answerId } });
  if (answer) {
    await prisma.profile.update({
      where: { userId: answer.authorId },
      data: { helpfulAnswers: { increment: 1 } },
    });
    await prisma.reputation.update({
      where: { userId: answer.authorId },
      data: {
        helpfulAnswers: { increment: 1 },
        solvedQuestions: { increment: 1 },
        score: { increment: 25 },
        level: calculateReputationLevel(
          (await prisma.reputation.findUnique({ where: { userId: answer.authorId } }))?.score ?? 0 + 25
        ),
      },
    });
    await notifyUser({
      userId: answer.authorId,
      actorId: userId,
      type: "SOLUTION",
      message: "marked your answer as the solution",
      link: `/post/${postId}`,
    });
  }

  revalidatePath(`/post/${postId}`);
  return { success: true };
}

export async function markHelpful(answerId: string) {
  await prisma.answer.update({
    where: { id: answerId },
    data: { helpful: { increment: 1 } },
  });
  return { success: true };
}

async function notifyMessageRecipients(conversationId: string, senderId: string, text: string) {
  const recipients = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: senderId } },
    select: { userId: true },
  });
  for (const { userId: recipientId } of recipients) {
    await notifyUser({
      userId: recipientId,
      actorId: senderId,
      type: "MESSAGE",
      message: "sent you a message",
      link: `/messages/${conversationId}`,
      pushTitle: "New message",
      pushBody: text.length > 80 ? `${text.slice(0, 80)}…` : text,
    });
  }
}

export async function sendMessage(conversationId: string, content: string) {
  const userId = await getCurrentUserId();
  const text = content.trim();
  if (!text) return { error: "Message cannot be empty" };

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) return { error: "You are not part of this conversation" };

  await prisma.message.create({
    data: { conversationId, senderId: userId, content: text },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  await notifyMessageRecipients(conversationId, userId, text);

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/notifications");
  return { success: true };
}

export async function startConversation(targetUserId: string, content: string) {
  const userId = await getCurrentUserId();
  if (userId === targetUserId) return { error: "You cannot message yourself" };

  const text = content.trim();
  if (!text) return { error: "Message cannot be empty" };

  const conversation = await getOrCreateConversation(userId, targetUserId);

  await prisma.message.create({
    data: { conversationId: conversation.id, senderId: userId, content: text },
  });
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  await notifyMessageRecipients(conversation.id, userId, text);

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversation.id}`);
  revalidatePath("/notifications");
  return { conversationId: conversation.id };
}

export async function markNotificationsRead() {
  const userId = await getCurrentUserId();
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  revalidatePath("/notifications");
  return { success: true };
}

export async function reportContent(formData: FormData) {
  const userId = await getCurrentUserId();
  await prisma.report.create({
    data: {
      reporterId: userId,
      postId: (formData.get("postId") as string) || undefined,
      reportedUserId: (formData.get("reportedUserId") as string) || undefined,
      reason: formData.get("reason") as "SPAM" | "FAKE_ACCOUNT" | "OFFENSIVE" | "UNSAFE_ADVICE" | "ADVERTISING" | "OTHER",
      description: (formData.get("description") as string) || undefined,
    },
  });
  return { success: true };
}

export async function adminSuspendUser(userId: string, suspended: boolean) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  await prisma.user.update({ where: { id: userId }, data: { suspended } });
  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeletePost(postId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/admin");
  revalidatePath("/feed");
  return { success: true };
}

export async function adminResolveReport(reportId: string, status: "RESOLVED" | "DISMISSED") {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  await prisma.report.update({ where: { id: reportId }, data: { status } });
  revalidatePath("/admin");
  return { success: true };
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const allowed = /^(image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|webm|quicktime))$/i;
  if (/heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name || "")) {
    return { error: "This iPhone photo needs to be converted. Add it again from the composer." };
  }
  if (!allowed.test(file.type)) {
    return { error: "Please upload a photo (JPG, PNG, WebP) or video (MP4, WebM)" };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "File must be 10MB or smaller" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "") || "upload";
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadDir = getUploadDir();
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  const isVideo = file.type.startsWith("video/");
  return { url: uploadPublicPath(filename), type: isVideo ? "video" : "image" };
}

export async function savePushSubscription(input: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
}) {
  const userId = await getCurrentUserId();
  if (!input.endpoint || !input.keys?.p256dh || !input.keys?.auth) {
    return { error: "Invalid subscription" };
  }

  const userAgent = input.userAgent?.slice(0, 500);

  await prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    create: {
      userId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent,
    },
    update: {
      userId,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent,
    },
  });

  return { success: true };
}

export async function deletePushSubscription(endpoint: string) {
  const userId = await getCurrentUserId();
  await prisma.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
  return { success: true };
}

export async function sendTestPush() {
  const userId = await getCurrentUserId();

  if (!isPushConfigured()) {
    return { error: "Push is not configured on the server. Add VAPID keys and redeploy." };
  }

  const count = await prisma.pushSubscription.count({ where: { userId } });
  if (count === 0) {
    return { error: "No device is registered yet. Enable alerts first." };
  }

  const sent = await sendPushToUser(userId, {
    title: "InstallBase",
    body: "Alerts are working on this device.",
    url: "/settings",
    urgency: "high",
  });

  if (!sent) {
    return { error: "Could not deliver a test alert. Try disabling and enabling alerts again." };
  }

  return { success: true, sent };
}
