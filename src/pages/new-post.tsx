import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/router";
import "../styles/new-post.css";
import MarkDownEditor from "@/components/markdown-editor";
import { uploadData, remove, list, getUrl } from "aws-amplify/storage";
import matter from "gray-matter";

type Draft = {
  title: string;
  image: string;
  content: string;
  category: string;
  draftFilePath: string;
};

const NewPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("diary");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [prevTokens, setPrevTokens] = useState<string[]>([]);
  const [draftFilePath, setDraftFilePath] = useState("");
  const PAGE_SIZE = 10;

  const router = useRouter();

  const fetchDrafts = async (token?: string) => {
    try {
      const { items, nextToken: after } = await list({
        path: "public/drafts/",
        options: {
          pageSize: PAGE_SIZE,
          nextToken: token
        }
      });

      const pageDrafts: Draft[] = await Promise.all(
        items.map(async obj => {
          const { url } = await getUrl({ path: obj.path });
          const md = await (await fetch(url)).text();
          const { data, content } = matter(md);
          return {
            title: data.title ?? "(untitled)",
            image: data.image ?? "/seed-default.png",
            category: (data.categories?.[0] ?? "diary") as string,
            content: content.trim(),
            draftFilePath: obj.path
          };
        })
      );

      setDrafts(pageDrafts);
      setNextToken(after);
    } catch (err) {
      console.error("Error fetching drafts:", err);
    }
  };


  useEffect(() => {
    fetchDrafts();
  }, []);

  const deleteDraft = async (draftPath: string) => {
    try {
      await remove({ path: draftPath });
      console.log("Draft deleted from S3");
      setDrafts(prev => prev.filter(d => d.draftFilePath !== draftPath));
    } catch (err) {
      console.error("Failed to delete draft:", err);
      alert("Failed to delete draft");
    }
  };


  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleDraftSelect = (draft: Draft) => {
    setTitle(draft.title);
    setContent(draft.content);
    setCategory(draft.category);
    setDraftFilePath(draft.draftFilePath);
  };

  const saveMdFile = async (publicationType: "public" | "draft") => {
    const dateStr = new Date().toISOString().slice(0, 10); // 例: 2025-05-01
    const frontMatter = `---
title: "${title}"
date: "${dateStr}"
description: ""
image: "seed-default.png"
categories: ["${category}"]
publications: ["${publicationType}"]
---

${content}`;

    const blob = new Blob([frontMatter], { type: "text/markdown" });
    const fileName =
      `${dateStr.replace(/-/g, "")}_${crypto.randomUUID()}.md`;
    const prefix = publicationType === "public" ? "posts/" : "drafts/";
    const s3Path = `public/${prefix}${fileName}`;

    try {
      await uploadData({
        path: s3Path,
        data: blob,
        options: {
          contentType: "text/markdown"
        }
      });

      if (publicationType === "public") {
        alert("Article uploaded successfully");
        if (draftFilePath) {
          await deleteDraft(draftFilePath);
          setDraftFilePath("");
        }
        router.push("/");
      } else {
        alert("Draft saved successfully");
        setDraftFilePath(s3Path);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload file to S3");
    }
  };

  const handleNext = () => {
    if (!nextToken) return;
    setPrevTokens(p => [...p, nextToken]);
    fetchDrafts(nextToken);
  };

  const handlePrev = () => {
    const tokens = [...prevTokens];
    const prev = tokens.pop();
    setPrevTokens(tokens);
    fetchDrafts(prev);
  };


  const handleUpload = async () => {
    saveMdFile("public");
  };

  const handleSaveDraft = async () => {
    saveMdFile("draft");
  };

  return (
    <div className="container flex">
      {/* 左側の入力エリア */}
      <div className="w-2/3 pr-4">
        <form className="form bg-white p-6 rounded shadow">
          <div>
            <label className="label" htmlFor="title">
              Title:
            </label>
            <input
              className="input"
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="content">
              Content:
            </label>
            <MarkDownEditor
              value={content}
              onChange={(value) => handleContentChange(value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="category">
              Category:
            </label>
            <select
              className="select"
              id="category"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="diary">Diary</option>
            </select>
          </div>
          <button className="button" type="button" onClick={handleSaveDraft}>
            Save Draft
          </button>
          <button className="button" type="submit" onClick={handleUpload}>
            Post Article
          </button>
        </form>
      </div>

      {/* 右側のDraftエリア */}
      <div className="w-1/3 pl-4">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Draft</h2>
          {drafts.length === 0 ? (<p className="text-gray-500">下書きがありません</p>) : (
            <div className="space-y-4">
              {drafts.map((draft, index) => (
                <div
                  key={index}
                  className="border p-4 flex items-center cursor-pointer hover:bg-gray-100"
                  onClick={() => handleDraftSelect(draft)}
                >
                  <img
                    src={draft.image}
                    alt={draft.title}
                    className="w-16 h-16 mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{draft.title}</h3>
                    <p className="text-sm text-gray-600">{draft.category}</p>
                  </div>
                </div>
              ))}
            </div>)}
        </div>
        {/* ナビゲーションボタン   */}
        <div className="flex justify-between mt-4">
          <button onClick={handlePrev} disabled={prevTokens.length === 0}
            className="button">Prev</button>

          <button onClick={handleNext} disabled={!nextToken}
            className="button">Next</button>
        </div>
      </div>
    </div>
  );
};

export default NewPost;

