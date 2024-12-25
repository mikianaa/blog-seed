import React, { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { NextPage } from "next";
import { useRouter } from "next/router";

const SignIn: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      console.log("No session, redirecting to sign-in process...");
      // サインインプロセスを非同期で呼び出す
      signIn(undefined, { redirect: false, callbackUrl: "/new-post" }).then(
        (result) => {
          console.log("Sign-in result:", result);
        },
      );
    } else {
      // セッションがある場合は /new-post にリダイレクト
      console.log("Session found, redirecting to /new-post...");
      router.push("/new-post");
    }
  }, [session, router]);

  return <div>Loading...</div>; // 遷移処理中に表示するコンテンツ
};

export default SignIn;
