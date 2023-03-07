import { z } from "zod";
import randomWords from "random-words";
import { S3_BUCKET_NAME } from "$env/static/private";
import type { Context } from "$lib/trpc/context";
import { initTRPC, TRPCError } from "@trpc/server";
import s3 from "$lib/server/connection";
import { maxVaultFilesCount, tokenRegex } from "$lib/constants";

export const t = initTRPC.context<Context>().create();

const token = z.string().regex(tokenRegex);

export const router = t.router({
  deleteAll: t.procedure.input(z.object({ token })).query(async ({ input }) => {
    s3.listObjectsV2(
      {
        Bucket: S3_BUCKET_NAME,
        Prefix: input.token + "/"
      },
      (err, data) => {
        if (err) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        if (!data?.Contents) return;
        const objects = data.Contents.map((obj) => ({ Key: obj.Key }));
        const deleteParams = {
          Bucket: S3_BUCKET_NAME,
          Delete: { Objects: objects }
        };
        s3.deleteObjects(deleteParams);
      }
    );
  }),
  delete: t.procedure.input(z.object({ token, key: z.string() })).query(async ({ input }) => {
    s3.deleteObject({
      Bucket: S3_BUCKET_NAME,
      Key: input.key
    });
  }),
  fetchToken: t.procedure.query(async ({}) => {
    const words = randomWords({
      exactly: 3,
      maxLength: 4
    });
    return words.join("-");
  }),
  fetchOne: t.procedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
    const data = await s3.getObject({
      Bucket: S3_BUCKET_NAME,
      Key: input.key
    });
    // TODO: More performant way to return Uint8Array
    return Array.from(await data.Body?.transformToByteArray()!);
  }),
  fetchAll: t.procedure.input(z.object({ token })).query(async ({ input }) => {
    if (input.token.length == 0) return [];
    const data = await s3.listObjectsV2({
      Bucket: S3_BUCKET_NAME,
      MaxKeys: maxVaultFilesCount,
      Delimiter: "/",
      Prefix: input.token + "/"
    });
    if (!data.Contents) return [];
    let files: Record<string, string>[] = [];
    for (let item of data.Contents) {
      files.push({
        // @ts-ignore
        key: item.Key,
        // @ts-ignore
        name: item.Key?.split("/")[1],
        // @ts-ignore
        size: item.Size,
        // @ts-ignore
        date: item.LastModified
      });
    }
    return files;
  })
});

export type Router = typeof router;
