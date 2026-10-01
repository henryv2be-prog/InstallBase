-- Legacy PROJECT posts are regular work posts; portfolio intent is already on postIntent/inPortfolio.
UPDATE "Post"
SET "type" = 'POST'
WHERE "type" = 'PROJECT';
