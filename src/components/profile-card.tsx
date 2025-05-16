import Image from "next/image";
import Link from "next/link";

type ProfileCardProps = {
    avatarSrc: string;
    name: string;
    intro: string;
    twitterUrl?: string;
    instagramUrl?: string;
    hatenaUrl?: string;
};

export default function ProfileCard({
    avatarSrc,
    name,
    intro,
    twitterUrl,
    instagramUrl,
    hatenaUrl,
}: ProfileCardProps) {
    return (
        <div className="p-4 shadow-md rounded-xl bg-white text-center mb-6 ">
            <h2 className="text-xl font-thin mb-2">About Me</h2>
            <div className="mx-auto w-24 h-24 relative mb-4">
                <Image
                    src={avatarSrc}
                    alt={name}
                    fill
                    className="rounded-full object-cover"
                    sizes="(max-width: 96px) 100vw, 96px"
                />
            </div>
            <h2 className="text-xl font-bold mb-2">{name}</h2>
            <p className="text-gray-600 text-sm mb-4">{intro}</p>
            <div className="flex justify-center gap-2">
                {twitterUrl && (
                    <Link href={twitterUrl} target="_blank" rel="noopener noreferrer">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition">
                            Twitter
                        </span>
                    </Link>
                )}
                {instagramUrl && (
                    <Link href={instagramUrl} target="_blank" rel="noopener noreferrer">
                        <span className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm hover:bg-pink-200 transition">
                            Instagram
                        </span>
                    </Link>
                )}
                {hatenaUrl && (
                    <Link href={hatenaUrl} target="_blank" rel="noopener noreferrer">
                        <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm hover:bg-indigo-200 transition">
                            はてな
                        </span>
                    </Link>
                )}
            </div>
        </div>
    );
}
