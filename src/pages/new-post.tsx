import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import "../styles/new-post.css";
import MarkDownEditor from "@/components/markdown-editor";
import { apiBaseUrl } from "next-auth/client/_utils";

// Draftタイプの定義
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
  const [draftFilePath, setDraftFilePath] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const router = useRouter();

  // 下書き一覧を取得する関数
  const fetchDrafts = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/getDrafts`);
      if (!response.ok) {
        throw new Error("Failed to fetch drafts");
      }
      const data = await response.json();
      setDrafts(data.drafts);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const deleteDraft = async (draftPath: string) => {
    const res = await fetch(`${apiBaseUrl}/deleteDraft`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draftFilePath: draftPath }),
    });

    if (res.ok) {
      console.log("Draft deleted successfully");
    } else {
      console.error("Failed to delete draft");
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

  const saveMdFile = async (publicationType: string) => {
    const date = new Date().toISOString().slice(0, 10);
    const frontMatter = `---
title: '${title}'
date: '${date}'
description: ''
image: 'seed-default.png'
categories: ['${category}']
publications: ['${publicationType}']
---

${content}`;

    const formData = new FormData();
    const blob = new Blob([frontMatter], { type: "text/markdown" });
    const file = new File([blob], `${title.replace(/[^a-zA-Z0-9]/g, "_")}.md`);
    const apiEndpoint =
      publicationType === "public"
        ? `${apiBaseUrl}/uploadNewPost`
        : `${apiBaseUrl}/uploadDraft`;
    formData.append("file", file);
    if (publicationType === "pulic" && draftFilePath != "") {
      formData.append("draftFilePath", draftFilePath);
    }

    const res = await fetch(apiEndpoint, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      if (publicationType === "public") {
        alert("Article uploaded successfully");
        //下書きからuploadした場合は下書きを削除する
        if (draftFilePath !== "") {
          await deleteDraft(draftFilePath);
        }

        router.push("/");
      } else if (publicationType === "draft") {
        alert("Draft saved successfully");
      } else {
        alert("Something went wrong!");
      }
    } else {
      alert("Failed to process the request");
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMdFile("public");
  };

  const handleSaveDraft = async () => {
    saveMdFile("draft");
  };

  return (
    <div className="container flex">
      {/* 左側の入力エリア */}
      <div className="w-2/3 pr-4">
        <form className="form bg-white p-6 rounded shadow" onSubmit={handleUpload}>
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
          <button className="button" type="submit">
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
      </div>
    </div>
  );
};

export default NewPost;

