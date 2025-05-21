import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/router";
import "../styles/new-post.css";
import MarkDownEditor from "@/components/markdown-editor";
import { uploadData, remove, list, getUrl } from "aws-amplify/storage";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
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
  const [loading, setLoading] = useState(false);
  const [categoryList, setCategoryList] = useState<{ label: string; path: string }[]>([]);
  const PAGE_SIZE = 5;

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

  const fetchCategories = async () => {
    try {
      const { url } = await getUrl({ path: "public/categories.json" });
      const res = await fetch(url);
      const json = await res.json();
      const filtered = json.filter((cat: { label: string }) => cat.label.toLowerCase() !== "all");
      setCategoryList(filtered);
    } catch (err) {
      console.error("カテゴリの取得に失敗しました:", err);
    }
  };


  useEffect(() => {
    fetchDrafts();
    fetchCategories();
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
    setLoading(true);
    const dateStr = new Date().toISOString().slice(0, 10);
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
    const isEditingDraft = publicationType === "draft" && draftFilePath !== "";
    const fileName = isEditingDraft
      ? draftFilePath.replace("public/", "")
      : `${publicationType === "draft" ? "drafts/" : "posts/"}${dateStr.replace(/-/g, "")}_${crypto.randomUUID()}.md`;

    const s3Path = `public/${fileName}`;


    try {
      await uploadData({
        path: s3Path,
        data: blob,
        options: {
          contentType: "text/markdown",
        },
      });

      if (publicationType === "public") {
        alert("Article uploaded successfully");
        if (draftFilePath) {
          await deleteDraft(draftFilePath);
          setDraftFilePath("");
        }
        await fetch("/api/trigger-rebuild", { method: "POST" });
        router.push("/");
        return;
      } else {
        alert("Draft saved successfully");
        setDraftFilePath(s3Path);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload file to S3");
    }
    finally {
      setLoading(false);
    }
  };

  const resetEditor = () => {
    if (title || content) {
      const ok = confirm("編集中の内容が失われます。続けますか？");
      if (!ok) return;
    }
    setTitle("");
    setContent("");
    setCategory("diary");
    setDraftFilePath("");
  };


  const handleNext = () => {
    if (!nextToken) return;
    setPrevTokens(p => [...p, nextToken]);
    fetchDrafts(nextToken);
  };

  const handlePrev = () => {
    if (prevTokens.length === 0) return;
    const tokens = [...prevTokens];
    tokens.pop()
    const prev = tokens[tokens.length - 1];
    setPrevTokens(tokens);
    fetchDrafts(prev);
  };


  const handleUpload = async () => {
    saveMdFile("public");
  };

  const handleSaveDraft = async () => {
    saveMdFile("draft");
    setTimeout(fetchDrafts, 3000);
  };

  const handleDelete = async (e: React.MouseEvent, draft: Draft) => {
    e.stopPropagation();

    const ok = window.confirm(`「${draft.title}」を削除しますか？`);
    if (!ok) return;

    try {
      await deleteDraft(draft.draftFilePath);
      if (draftFilePath === draft.draftFilePath) {
        resetEditor();
      }
    } catch (err) {
      alert("削除に失敗しました");
      console.error("Failed to delete draft:", err);
    }
  };
  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
          <div className="text-xl font-bold">保存中...</div>
        </div>
      )}
      <div className="flex w-full max-w-6xl gap-6 mb-10">
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
                {categoryList.map((cat) => (
                  <option key={cat.path} value={cat.path}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="button" type="button" onClick={resetEditor}>
                新規作成
              </button>
              <button className="button" type="button" onClick={handleSaveDraft}>
                Save Draft
              </button>
              <button className="button" type="button" onClick={handleUpload}>
                Post Article
              </button>
            </div>
          </form>
        </div>

        {/* 右側のDraftエリア */}
        <div className="w-1/3 pl-4">
          <div className="bg-white p-6 rounded shadow">
            <div>
              <label className="label" htmlFor="category">
                Draft
              </label>
            </div>
            {drafts.length === 0 ? (<p className="text-gray-500">下書きがありません</p>) : (
              <div className="space-y-4">
                {drafts.map((draft, index) => {
                  const isEditing = draft.draftFilePath === draftFilePath;
                  return (
                    <div
                      key={index}
                      className={`border p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-100 ${isEditing ? "bg-blue-100 border-blue-500" : ""}`}
                      onClick={() => handleDraftSelect(draft)}
                    >
                      <img
                        src={draft.image}
                        alt={draft.title}
                        className="w-16 h-16"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold truncate w-28">{draft.title}</h3>
                          {isEditing && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold text-blue-800 bg-blue-200 rounded whitespace-nowrap">
                              編集中
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{draft.category}</p>
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={(e) => handleDelete(e, draft)}
                            className="text-gray-400 hover:text-red-600 text-sm"
                          >
                            🗑 削除
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
    </>
  );
};

export default function NewPostPage() {
  return (
    <div className="pt-5">
      <Authenticator initialState="signIn" hideSignUp>
        {({ signOut }) => (
          <div className="flex flex-col container mx-auto">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">ログイン中: </p>
              <button className="text-blue-600 text-sm" onClick={signOut}>
                サインアウト
              </button>
            </div>
            <NewPost />
          </div>
        )}
      </Authenticator>
    </div>
  );
}
