import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  const handleSignOut = async () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 border-b h-20 z-10 bg-white">
      <div className="max-w-4xl mx-auto flex justify-between items-center h-20">
        <Link href="/">
          <div className="text-4xl font-medium">Seed</div>
        </Link>

        <div className="mb-4">
          {currentPath === "/new-post" ? (
            <button className="button" type="button" onClick={handleSignOut}>
              Sign out
            </button>
          ) : (
            <Link href="/sign-in">
              <div className="bg-blue-500 text-white px-4 py-2 rounded">
                New Post
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
