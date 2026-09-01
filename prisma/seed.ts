import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { DEMO_IMAGES } from "../src/lib/constants";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const IMAGES = DEMO_IMAGES;

const installers = [
  { name: "Mike van der Merwe", username: "mike_security", city: "Johannesburg", country: "South Africa", specialties: ["CCTV", "Access Control"], experience: "TEN_PLUS", verified: true, reputation: 4820, brags: 36, helpful: 128, bio: "CCTV & access control installer. 15 years in the industry. Hikvision / Dahua / Ubiquiti specialist." },
  { name: "Sarah Ndlovu", username: "sarah_installs", city: "Cape Town", country: "South Africa", specialties: ["CCTV", "Networking"], experience: "FIVE_TO_TEN", verified: true, reputation: 3210, brags: 22, helpful: 95, bio: "Commercial CCTV specialist. Love solving tricky network issues." },
  { name: "Tom Mitchell", username: "tomtech", city: "Durban", country: "South Africa", specialties: ["Networking", "CCTV"], experience: "THREE_TO_FIVE", verified: false, reputation: 1890, brags: 14, helpful: 67, bio: "Rack cleanup enthusiast. Ubiquiti certified." },
  { name: "James Okonkwo", username: "james_cctv", city: "Lagos", country: "Nigeria", specialties: ["CCTV", "Alarms"], experience: "FIVE_TO_TEN", verified: true, reputation: 2650, brags: 19, helpful: 82, bio: "Large commercial installations across West Africa." },
  { name: "David Chen", username: "davidtech", city: "Singapore", country: "Singapore", specialties: ["Access Control", "Intercoms"], experience: "TEN_PLUS", verified: true, reputation: 4100, brags: 28, helpful: 110, bio: "Access control and intercom systems for high-rise buildings." },
  { name: "Peter Botha", username: "peter_alarms", city: "Pretoria", country: "South Africa", specialties: ["Alarms", "CCTV"], experience: "FIVE_TO_TEN", verified: false, reputation: 1540, brags: 11, helpful: 45, bio: "Ajax and Paradox alarm systems. Also do CCTV." },
  { name: "Lisa Fernandez", username: "lisa_lowvolt", city: "Miami", country: "USA", specialties: ["CCTV", "Gate Automation"], experience: "THREE_TO_FIVE", verified: false, reputation: 980, brags: 8, helpful: 32, bio: "Residential and small commercial. Centurion gate motors." },
  { name: "Ahmed Hassan", username: "ahmed_security", city: "Dubai", country: "UAE", specialties: ["CCTV", "Access Control", "Networking"], experience: "TEN_PLUS", verified: true, reputation: 5200, brags: 42, helpful: 145, bio: "Mega projects across the Middle East. Hikvision elite partner." },
  { name: "Chris Williams", username: "chris_racks", city: "London", country: "UK", specialties: ["Networking"], experience: "FIVE_TO_TEN", verified: true, reputation: 2340, brags: 16, helpful: 78, bio: "If it fits in a rack, I've probably installed it." },
  { name: "Ryan O'Brien", username: "ryan_electric", city: "Dublin", country: "Ireland", specialties: ["Electrician", "CCTV"], experience: "THREE_TO_FIVE", verified: false, reputation: 760, brags: 5, helpful: 28, bio: "Electrician doing low-voltage security work on the side." },
  { name: "Marcus Johnson", username: "marcus_cctv", city: "Atlanta", country: "USA", specialties: ["CCTV"], experience: "FIVE_TO_TEN", verified: true, reputation: 2100, brags: 18, helpful: 56, bio: "Warehouse and logistics CCTV specialist." },
  { name: "Kevin Naidoo", username: "kevin_net", city: "Johannesburg", country: "South Africa", specialties: ["Networking"], experience: "ONE_TO_THREE", verified: false, reputation: 420, brags: 3, helpful: 15, bio: "Learning the trade. MikroTik and Ubiquiti." },
  { name: "Anna Kowalski", username: "anna_access", city: "Warsaw", country: "Poland", specialties: ["Access Control"], experience: "FIVE_TO_TEN", verified: true, reputation: 1780, brags: 12, helpful: 48, bio: "Suprema and ZKTeco access control systems." },
  { name: "Ben Taylor", username: "ben_gates", city: "Perth", country: "Australia", specialties: ["Gate Automation"], experience: "TEN_PLUS", verified: true, reputation: 2890, brags: 21, helpful: 72, bio: "Centurion, ET, and FAAC gate automation expert." },
  { name: "Nomsa Dlamini", username: "nomsa_solar", city: "Bloemfontein", country: "South Africa", specialties: ["Solar", "Electrician"], experience: "THREE_TO_FIVE", verified: false, reputation: 650, brags: 4, helpful: 19, bio: "Solar + security integration." },
  { name: "Frank Mueller", username: "frank_bosch", city: "Berlin", country: "Germany", specialties: ["CCTV", "Alarms"], experience: "TEN_PLUS", verified: true, reputation: 3450, brags: 25, helpful: 88, bio: "Bosch and Axis systems. German precision." },
  { name: "Steve Adams", username: "steve_intercom", city: "Melbourne", country: "Australia", specialties: ["Intercoms", "Access Control"], experience: "FIVE_TO_TEN", verified: false, reputation: 1320, brags: 9, helpful: 41, bio: "Video intercoms for apartment buildings." },
  { name: "Paul Reddy", username: "paul_fibre", city: "Hyderabad", country: "India", specialties: ["Networking", "CCTV"], experience: "FIVE_TO_TEN", verified: true, reputation: 2560, brags: 17, helpful: 63, bio: "Fibre backbone specialist. 10G networks." },
  { name: "Demo User", username: "demo", city: "Johannesburg", country: "South Africa", specialties: ["CCTV", "Access Control"], experience: "THREE_TO_FIVE", verified: false, reputation: 500, brags: 2, helpful: 5, bio: "Demo account for testing InstallBase." },
  { name: "Admin User", username: "admin", city: "Johannesburg", country: "South Africa", specialties: ["CCTV"], experience: "TEN_PLUS", verified: true, reputation: 10000, brags: 50, helpful: 200, bio: "InstallBase platform admin." },
];

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
    console.error("Refusing to seed production database. Set ALLOW_SEED=true to override.");
    process.exit(1);
  }

  console.log("🌱 Seeding InstallBase...");

  await prisma.bragOfWeek.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.bragPoint.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.postProduct.deleteMany();
  await prisma.postCategory.deleteMany();
  await prisma.postMedia.deleteMany();
  await prisma.post.deleteMany();
  await prisma.projectMedia.deleteMany();
  await prisma.project.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.reputation.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.job.deleteMany();

  const passwordHash = await bcrypt.hash("InstallBase123!", 12);

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "CCTV", slug: "cctv", icon: "📷" } }),
    prisma.category.create({ data: { name: "Access Control", slug: "access-control", icon: "🔐" } }),
    prisma.category.create({ data: { name: "Alarms", slug: "alarms", icon: "🚨" } }),
    prisma.category.create({ data: { name: "Gate Automation", slug: "gate-automation", icon: "🚗" } }),
    prisma.category.create({ data: { name: "Networking", slug: "networking", icon: "🌐" } }),
    prisma.category.create({ data: { name: "Intercoms", slug: "intercoms", icon: "📞" } }),
    prisma.category.create({ data: { name: "Electric Fence", slug: "electric-fence", icon: "⚡" } }),
    prisma.category.create({ data: { name: "Solar", slug: "solar", icon: "☀️" } }),
    prisma.category.create({ data: { name: "General Installation", slug: "general", icon: "🔧" } }),
  ]);

  const brands = await Promise.all([
    prisma.brand.create({ data: { name: "Hikvision", slug: "hikvision", categoryId: categories[0].id } }),
    prisma.brand.create({ data: { name: "Dahua", slug: "dahua", categoryId: categories[0].id } }),
    prisma.brand.create({ data: { name: "Axis", slug: "axis", categoryId: categories[0].id } }),
    prisma.brand.create({ data: { name: "Ubiquiti", slug: "ubiquiti", categoryId: categories[4].id } }),
    prisma.brand.create({ data: { name: "MikroTik", slug: "mikrotik", categoryId: categories[4].id } }),
    prisma.brand.create({ data: { name: "ZKTeco", slug: "zkteco", categoryId: categories[1].id } }),
    prisma.brand.create({ data: { name: "Suprema", slug: "suprema", categoryId: categories[1].id } }),
    prisma.brand.create({ data: { name: "Ajax", slug: "ajax", categoryId: categories[2].id } }),
    prisma.brand.create({ data: { name: "Centurion", slug: "centurion", categoryId: categories[3].id } }),
    prisma.brand.create({ data: { name: "Bosch", slug: "bosch", categoryId: categories[0].id } }),
  ]);

  const products = await Promise.all([
    prisma.product.create({ data: { name: "DS-2CD2143G2-I", slug: "hikvision-ds-2cd2143g2-i", brandId: brands[0].id, model: "DS-2CD2143G2-I", description: "4MP AcuSense dome camera" } }),
    prisma.product.create({ data: { name: "DS-7616NI-K2/16P", slug: "hikvision-ds-7616ni-k2-16p", brandId: brands[0].id, model: "DS-7616NI-K2/16P", description: "16-channel PoE NVR" } }),
    prisma.product.create({ data: { name: "IPC-HFW2431T-ZS", slug: "dahua-ipc-hfw2431t-zs", brandId: brands[1].id, model: "IPC-HFW2431T-ZS", description: "4MP varifocal bullet" } }),
    prisma.product.create({ data: { name: "USW-Pro-48-PoE", slug: "ubiquiti-usw-pro-48-poe", brandId: brands[3].id, model: "USW-Pro-48-PoE", description: "48-port PoE switch" } }),
    prisma.product.create({ data: { name: "UAP-AC-Pro", slug: "ubiquiti-uap-ac-pro", brandId: brands[3].id, model: "UAP-AC-Pro", description: "Dual-band access point" } }),
    prisma.product.create({ data: { name: "SpeedFace-V5L", slug: "zkteco-speedface-v5l", brandId: brands[5].id, model: "SpeedFace-V5L", description: "Face recognition terminal" } }),
    prisma.product.create({ data: { name: "BioEntry W2", slug: "suprema-bioentry-w2", brandId: brands[6].id, model: "BioEntry W2", description: "Fingerprint access reader" } }),
    prisma.product.create({ data: { name: "Hub 2 Plus", slug: "ajax-hub-2-plus", brandId: brands[7].id, model: "Hub 2 Plus", description: "Wireless alarm hub" } }),
    prisma.product.create({ data: { name: "D10 Smart", slug: "centurion-d10-smart", brandId: brands[8].id, model: "D10 Smart", description: "Centurion sliding gate motor" } }),
    prisma.product.create({ data: { name: "P1377-E", slug: "axis-p1377-e", brandId: brands[2].id, model: "P1377-E", description: "5MP outdoor network camera" } }),
  ]);

  const tags = await Promise.all([
    "Hikvision", "Dahua", "PoE", "VLAN", "Fibre", "ANPR", "Cable Management",
    "Rack Build", "Night Vision", "Ubiquiti", "Access Control", "Warehouse",
  ].map((name) =>
    prisma.tag.create({
      data: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
    })
  ));

  const users = [];
  for (const installer of installers) {
    const user = await prisma.user.create({
      data: {
        email: installer.username === "demo"
          ? "demo@installbase.io"
          : installer.username === "admin"
          ? "admin@installbase.io"
          : `${installer.username}@installbase.io`,
        name: installer.name,
        passwordHash,
        role: installer.username === "admin" ? "ADMIN" : "USER",
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${installer.username}`,
        profile: {
          create: {
            username: installer.username,
            bio: installer.bio,
            city: installer.city,
            country: installer.country,
            specialties: installer.specialties,
            experienceLevel: installer.experience as "APPRENTICE" | "ONE_TO_THREE" | "THREE_TO_FIVE" | "FIVE_TO_TEN" | "TEN_PLUS",
            reputationScore: installer.reputation,
            reputationLevel: installer.reputation >= 5000 ? "MASTER" : installer.reputation >= 3000 ? "EXPERT" : installer.reputation >= 1500 ? "PRO" : installer.reputation >= 500 ? "EXPERIENCED" : "INSTALLER",
            verified: installer.verified,
            bragCount: installer.brags,
            helpfulAnswers: installer.helpful,
          },
        },
        reputation: {
          create: {
            score: installer.reputation,
            level: installer.reputation >= 5000 ? "MASTER" : installer.reputation >= 3000 ? "EXPERT" : installer.reputation >= 1500 ? "PRO" : "EXPERIENCED",
            helpfulAnswers: installer.helpful,
            bragEngagement: installer.brags * 10,
            likesReceived: installer.reputation / 2,
          },
        },
      },
    });
    users.push(user);
  }

  // Create follows
  for (let i = 0; i < users.length; i++) {
    const followCount = 3 + (i % 5);
    for (let j = 1; j <= followCount; j++) {
      const targetIdx = (i + j) % users.length;
      if (targetIdx !== i) {
        await prisma.follow.create({
          data: { followerId: users[i].id, followingId: users[targetIdx].id },
        }).catch(() => {});
      }
    }
  }

  const postTemplates = [
    { type: "POST" as const, author: 0, content: "Finally finished this 24-camera installation. Customer wanted everything hidden, so we ran the majority of the cabling through the ceiling. Used Hikvision ColorVu domes throughout.", title: null, images: [IMAGES.cctv, IMAGES.cable], location: "Sandton, Johannesburg", products: [0, 1], tags: [0, 6] },
    { type: "BRAG" as const, author: 0, content: "Just completed this Hikvision installation across 4 buildings. One of our biggest jobs this year.", title: "64 Camera Commercial Installation", images: [IMAGES.rack, IMAGES.camera, IMAGES.cctv, IMAGES.install], location: "Midrand, Johannesburg", bragDetails: { cameras: "64", nvrs: "4", fibre: "2.5km", storage: "12TB", access_control: "Yes", anpr: "4 lanes" }, bragScore: 521, products: [0, 1, 3], tags: [0, 4, 5] },
    { type: "QUESTION" as const, author: 1, content: "Anyone know why this Hikvision camera keeps losing connection after switching to night mode?\n\nNVR: DS-7616NI-K2/16P\nCamera: DS-2CD2143G2-I\nSwitch: Ubiquiti USW-24-PoE\n\nIt works fine during the day but drops offline 10-15 minutes after dark.", title: "Hikvision camera drops offline at night", images: [IMAGES.camera], location: null, solved: true, products: [0, 1], tags: [0, 8] },
    { type: "POST" as const, author: 2, content: "Before & after of this rack cleanup. Client had 3 different installers over the years and it was a mess. Took me a full day but worth it.", title: "Rack Cleanup — Before & After", images: [IMAGES.rack, IMAGES.network], location: "Durban", products: [3], tags: [7, 9] },
    { type: "VIDEO" as const, author: 2, content: "How I terminate my outdoor CAT6 connections. Using gel-filled connectors and proper drain wire grounding. This method has survived 3 Cape Town winters without a single failure.", title: "Outdoor CAT6 Termination Method", images: [IMAGES.cable], location: null, tags: [6] },
    { type: "BRAG" as const, author: 7, content: "48-camera warehouse installation with full ANPR at loading bays. Customer can now track every vehicle entering and leaving.", title: "48 Camera Warehouse + ANPR", images: [IMAGES.cctv, IMAGES.rack, IMAGES.install], location: "Dubai Logistics City", bragDetails: { cameras: "48", anpr: "6 lanes", nvrs: "2", storage: "48TB" }, bragScore: 342, products: [0, 1], tags: [5, 11] },
    { type: "QUESTION" as const, author: 4, content: "Has anyone integrated Suprema BioEntry W2 with Hikvision NVR for door event logging? Client wants access events visible on the VMS timeline.", title: "Suprema + Hikvision integration", images: [], location: null, solved: false, products: [6, 1], tags: [10] },
    { type: "POST" as const, author: 3, content: "Installed 16 Ajax MotionProtect detectors across a 3-story office. Zero false alarms after proper pet-immunity configuration. Wireless install took 4 hours total.", title: null, images: [IMAGES.security], location: "Lagos, Nigeria", products: [7], tags: [0] },
    { type: "BRAG" as const, author: 7, content: "Complete security overhaul for a luxury hotel. 120 cameras, full access control, intercoms, and gate automation.", title: "Luxury Hotel Security System", images: [IMAGES.access, IMAGES.cctv, IMAGES.rack], location: "Dubai Marina", bragDetails: { cameras: "120", access_points: "85", intercoms: "24", gate_motors: "4" }, bragScore: 248, products: [0, 6], tags: [0, 10] },
    { type: "QUESTION" as const, author: 9, content: "Ubiquiti USW-Pro-48-PoE keeps rebooting when I connect more than 20 cameras. Total PoE budget should be fine. Anyone seen this?", title: "USW-Pro-48-PoE rebooting under load", images: [IMAGES.network], location: null, solved: true, products: [3], tags: [9, 2] },
    { type: "POST" as const, author: 8, content: "Clean fibre termination on a 48-port patch panel. OM4 multimode, all tested and certified.", title: null, images: [IMAGES.network, IMAGES.rack], location: "London", tags: [4, 7] },
    { type: "BRAG" as const, author: 0, content: "Best cable management job I've done this year. 32 cameras, all home-run to central comms room.", title: "32 Camera Cable Management", images: [IMAGES.cable, IMAGES.rack], location: "Johannesburg", bragDetails: { cameras: "32", cable_runs: "All home-run", longest_run: "85m" }, bragScore: 189, products: [0, 3], tags: [6, 7] },
    { type: "POST" as const, author: 12, content: "Installed 12 ZKTeco SpeedFace terminals across a factory. Face + fingerprint + card. Shift management integrated.", title: null, images: [IMAGES.access], location: "Warsaw", products: [5], tags: [10] },
    { type: "QUESTION" as const, author: 11, content: "What's the best way to run fibre between two buildings 150m apart? Underground conduit is already in place.", title: "Fibre between buildings — best approach?", images: [], location: null, solved: false, tags: [4] },
    { type: "BRAG" as const, author: 13, content: "Dual Centurion D10 Smart gate motors on a 12m sliding gate. Battery backup and solar charging.", title: "12m Sliding Gate Automation", images: [IMAGES.install], location: "Perth, Australia", bragDetails: { gate_length: "12m", motors: "2x D10 Smart", backup: "Solar + battery" }, bragScore: 156, products: [8], tags: [0] },
  ];

  const posts = [];
  for (const template of postTemplates) {
    const post = await prisma.post.create({
      data: {
        authorId: users[template.author].id,
        type: template.type,
        content: template.content,
        title: template.title,
        location: template.location,
        solved: template.solved ?? false,
        bragScore: template.bragScore ?? 0,
        bragDetails: template.bragDetails ?? undefined,
        media: {
          create: (template.images ?? []).map((url, i) => ({ url, order: i })),
        },
        products: {
          create: (template.products ?? []).map((idx) => ({ productId: products[idx].id })),
        },
        tags: {
          create: (template.tags ?? []).map((idx) => ({ tagId: tags[idx].id })),
        },
      },
    });
    posts.push(post);
  }

  // More posts to reach 50+
  const extraContents = [
    "Quick tip: always test PoE budget before mounting cameras. Saved me twice this week.",
    "Just passed my Hikvision certified installer exam. Ready for bigger projects!",
    "Night shot from the Axis P1377-E. IR performance is incredible on this model.",
    "Paradox EVO system with 32 wireless zones. Clean install, happy customer.",
    "MikroTik CRS328 switch handling VLAN segmentation for 64 cameras. Works beautifully.",
    "Electric fence integration with the alarm system — strobe + siren on breach.",
    "Solar-powered CCTV for a remote farm. 4 cameras, LTE backhaul, 3-day battery backup.",
    "FAAC 740 sliding gate motor replacement. Old motor was 15 years old.",
    "Testing ANPR camera at 60km/h. Hikvision DS-TCG406-E performing well.",
    "Intercom system for 48-unit apartment. 2-wire bus, video on every panel.",
    "DSC PowerSeries Neo with Alarm.com. Customer loves the app control.",
    "Before: spaghetti cables. After: labeled, bundled, documented. The basics matter.",
    "Uniview 4K camera comparison with Hikvision. Surprisingly good image quality.",
    "PoE extender saved this install — camera was 120m from the switch.",
    "Gate motor + CCTV + intercom combo install. One app for everything.",
    "Warehouse aisle coverage planning. Used JVSG calculator, spot on.",
    "Texecom Premier Elite 48 zone install. Wired + wireless hybrid.",
    "Nice CAME BXV6G garage motor with MyNice app integration.",
    "TP-Link Omada switch as budget alternative to Ubiquiti. Honest review inside.",
    "Cisco SG350 VLAN config for isolated camera network. Step by step.",
    "Risco Agility 3 with Risco Cloud. Clean wireless install.",
    "Hanwha Wisenet camera on a budget residential job. Client is happy.",
    "Gallagher access control at a data center. High security requirements.",
    "Paxton Net2 plus integration with fire alarm for door release.",
    "ET Nice Robus 600 gate motor on a heavy industrial gate.",
    "Wireless bridge between buildings using Ubiquiti NanoStation. 200m link.",
    "Camera pole installation in a parking lot. Concrete base and conduit.",
    "Server room environmental monitoring added to the NMS.",
    "Mobile DVR install on a fleet of delivery trucks.",
    "Thermal camera for perimeter detection at a solar farm.",
    "Conference room AV + CCTV integration for a corporate HQ.",
    "Lift access control with destination dispatch integration.",
    "Biometric enrollment day — 200 employees, 4 hours total.",
    "Retrofit: replacing 16 analog cameras with IP on existing coax using converters.",
    "Testing cable with my Fluke. 12 failures found before we mounted a single camera.",
    "Customer wanted 'invisible' cameras. Pinhole lenses in smoke detector housings.",
  ];

  for (let i = 0; i < extraContents.length; i++) {
    const authorIdx = i % users.length;
    const post = await prisma.post.create({
      data: {
        authorId: users[authorIdx].id,
        type: i % 7 === 0 ? "BRAG" : i % 5 === 0 ? "QUESTION" : "POST",
        content: extraContents[i],
        title: i % 7 === 0 ? `Installation Highlight #${i + 1}` : null,
        bragScore: i % 7 === 0 ? 50 + (i * 7) % 200 : 0,
        bragDetails: i % 7 === 0 ? { highlight: `Job #${i + 1}` } : undefined,
        media: {
          create: [{ url: Object.values(IMAGES)[i % 8], order: 0 }],
        },
        tags: {
          create: [{ tagId: tags[i % tags.length].id }],
        },
      },
    });
    posts.push(post);
  }

  // Likes, comments, brag points
  for (const post of posts) {
    const likeCount = 5 + Math.floor(Math.random() * 30);
    const commentCount = 2 + Math.floor(Math.random() * 10);
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

    for (let i = 0; i < likeCount && i < shuffledUsers.length; i++) {
      await prisma.like.create({
        data: { postId: post.id, userId: shuffledUsers[i].id },
      }).catch(() => {});
    }

    const comments = [
      "Great work! Clean install.",
      "What switch did you use for PoE?",
      "That's a sick install 🔥",
      "How long did this take you?",
      "Nice cable management!",
      "What lens did you go with on those domes?",
      "Impressive project. What was the total budget?",
      "Did you use conduit or trunking?",
      "This is exactly what I needed to see. Thanks for sharing!",
      "Clean work mate. Respect.",
    ];

    for (let i = 0; i < commentCount; i++) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: shuffledUsers[i % shuffledUsers.length].id,
          content: comments[i % comments.length],
        },
      });
    }

    if (post.type === "BRAG") {
      const bragCount = 3 + Math.floor(Math.random() * 15);
      for (let i = 0; i < bragCount && i < shuffledUsers.length; i++) {
        await prisma.bragPoint.create({
          data: { postId: post.id, userId: shuffledUsers[i].id },
        }).catch(() => {});
      }
    }
  }

  // Answers for questions
  const questionPosts = posts.filter((_, i) => {
    const p = postTemplates.find((t, idx) => idx === i);
    return p?.type === "QUESTION" || (i >= postTemplates.length && i % 5 === 0);
  });

  const answerTexts = [
    "Check your PoE budget first. Night mode IR draws more power.",
    "We had the same issue — turned out to be a firmware bug. Update the camera.",
    "Try disabling H.265+ and see if it stabilizes. Worked for us.",
    "Make sure the switch port isn't set to auto-negotiate at 100Mbps.",
    "Ground the drain wire properly on outdoor runs.",
    "Use a media converter if the run exceeds 100m.",
  ];

  for (const qPost of questionPosts.slice(0, 15)) {
    const answerCount = 3 + Math.floor(Math.random() * 8);
    for (let i = 0; i < answerCount; i++) {
      const isSolution = i === 0 && Math.random() > 0.3;
      await prisma.answer.create({
        data: {
          postId: qPost.id,
          authorId: users[(i + 3) % users.length].id,
          content: answerTexts[i % answerTexts.length] + (isSolution ? " This fixed it for me." : ""),
          helpful: Math.floor(Math.random() * 20),
          isSolution,
        },
      });
    }
    const hasSolution = await prisma.answer.findFirst({ where: { postId: qPost.id, isSolution: true } });
    if (hasSolution) {
      await prisma.post.update({ where: { id: qPost.id }, data: { solved: true } });
    }
  }

  // Projects
  const projectData = [
    { author: 0, title: "Commercial CCTV Upgrade", slug: "commercial-cctv-upgrade", description: "64 cameras across four buildings with fibre backbone and centralized monitoring.", location: "Johannesburg", equipment: ["Hikvision cameras", "Hikvision NVR", "Ubiquiti switches", "Fibre backbone"], challenges: "Building 3 had no existing network infrastructure. Had to run new conduit through occupied office space on weekends.", solution: "We installed a dedicated fibre link between buildings and used media converters at each end. Weekend work minimized disruption.", images: [IMAGES.cctv, IMAGES.rack, IMAGES.cable] },
    { author: 7, title: "Luxury Hotel Security", slug: "luxury-hotel-security", description: "Complete security system for a 200-room luxury hotel including CCTV, access control, and intercoms.", location: "Dubai Marina", equipment: ["120x Hikvision cameras", "Suprema access control", "Video intercoms"], challenges: "Heritage-style architecture meant cameras had to be completely hidden.", solution: "Custom housings painted to match facade. Pinhole lenses where possible.", images: [IMAGES.access, IMAGES.cctv] },
    { author: 2, title: "Warehouse ANPR System", slug: "warehouse-anpr-system", description: "ANPR cameras at all loading bays with integration to warehouse management system.", location: "Durban", equipment: ["Hikvision ANPR cameras", "Custom API integration", "Ubiquiti network"], challenges: "Vehicles moving at varying speeds required careful camera positioning.", solution: "Two-camera setup per lane — one for approach, one for departure.", images: [IMAGES.install, IMAGES.cctv] },
    { author: 3, title: "Office Access Control", slug: "office-access-control-lagos", description: "ZKTeco face recognition access for a 500-employee office building.", location: "Lagos, Nigeria", equipment: ["ZKTeco SpeedFace V5L", "Electronic locks", "Fire alarm integration"], challenges: "Existing fire alarm needed to release all doors on activation.", solution: "Relay interface between access controller and fire panel.", images: [IMAGES.access] },
    { author: 13, title: "Solar Farm Perimeter", slug: "solar-farm-perimeter", description: "Thermal and optical cameras around a 50-hectare solar farm perimeter.", location: "Perth, Australia", equipment: ["Axis thermal cameras", "Hikvision PTZ", "Microwave sensors"], challenges: "No power or network at perimeter points.", solution: "Solar-powered poles with wireless mesh backhaul.", images: [IMAGES.security, IMAGES.camera] },
  ];

  for (const proj of projectData) {
    await prisma.project.create({
      data: {
        authorId: users[proj.author].id,
        title: proj.title,
        slug: proj.slug,
        description: proj.description,
        location: proj.location,
        equipment: proj.equipment,
        challenges: proj.challenges,
        solution: proj.solution,
        media: {
          create: proj.images.map((url, i) => ({ url, order: i })),
        },
      },
    });
  }

  // Jobs
  await Promise.all([
    prisma.job.create({ data: { title: "CCTV Installer Required — Johannesburg", description: "Commercial installation, 32 cameras across warehouse and office. Must have Hikvision experience.", location: "Johannesburg, South Africa", category: "CCTV", requirements: "3+ years experience, own tools, Hikvision certified preferred" } }),
    prisma.job.create({ data: { title: "Access Control Technician — Cape Town", description: "Suprema BioStar 2 installation at a corporate office. 40 doors.", location: "Cape Town, South Africa", category: "Access Control", requirements: "Suprema experience essential" } }),
    prisma.job.create({ data: { title: "Network Engineer — Remote Support", description: "Ongoing support for multi-site CCTV network. MikroTik and Ubiquiti.", location: "Remote", category: "Networking", requirements: "MikroTik certified, VLAN experience" } }),
    prisma.job.create({ data: { title: "Alarm Installer — Durban", description: "Ajax wireless alarm system for residential estate. 50 homes.", location: "Durban, South Africa", category: "Alarms", requirements: "Ajax certified installer" } }),
    prisma.job.create({ data: { title: "Gate Automation Subcontractor", description: "Centurion D10 installs on 8 residential properties. Subcontract basis.", location: "Pretoria, South Africa", category: "Gate Automation", requirements: "Centurion certified, own transport" } }),
  ]);

  // Notifications
  for (let i = 0; i < 20; i++) {
    await prisma.notification.create({
      data: {
        userId: users[i % users.length].id,
        actorId: users[(i + 5) % users.length].id,
        type: ["LIKE", "COMMENT", "FOLLOW", "ANSWER", "BRAG_RANKING"][i % 5] as "LIKE" | "COMMENT" | "FOLLOW" | "ANSWER" | "BRAG_RANKING",
        message: ["liked your post", "commented on your post", "started following you", "answered your question", "Your brag is trending!"][i % 5],
        link: `/post/${posts[i % posts.length].id}`,
        read: i % 3 === 0,
      },
    });
  }

  // Conversations
  const conv = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: users[0].id }, { userId: users[1].id }],
      },
      messages: {
        create: [
          { senderId: users[1].id, content: "Hey Mike, saw your 64-camera brag. Impressive work! What NVR model did you use?" },
          { senderId: users[0].id, content: "Thanks Sarah! DS-7732NI-K4/16P for the main building, DS-7616NI-K2/16P for the smaller ones." },
          { senderId: users[1].id, content: "Nice. Did you use Hikvision's native VMS or a third party?" },
          { senderId: users[0].id, content: "iVMS-4200 for this one. Client wanted the free option. Works well for their scale." },
        ],
      },
    },
  });

  // Brag of the week
  const bragPosts = posts.filter((_, i) => i < 8);
  const bragCategories = [
    "Best CCTV Installation", "Best Access Control", "Best Cable Management", "Best Rack",
    "Biggest Installation", "Most Creative Solution", "Best Before & After", "Best Small Installation",
  ];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  for (let i = 0; i < bragCategories.length; i++) {
    await prisma.bragOfWeek.create({
      data: {
        postId: bragPosts[i % bragPosts.length].id,
        category: bragCategories[i],
        weekStart,
      },
    });
  }

  // Sample report
  await prisma.report.create({
    data: {
      reporterId: users[5].id,
      postId: posts[posts.length - 1].id,
      reason: "ADVERTISING",
      description: "This looks like a promotional post rather than a genuine installation share.",
      status: "PENDING",
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   ${users.length} installers`);
  console.log(`   ${posts.length} posts`);
  console.log(`   ${products.length} products`);
  console.log(`   Demo login: demo@installbase.io / InstallBase123!`);
  console.log(`   Admin login: admin@installbase.io / InstallBase123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
