import Image from "next/image";
import Link from "next/link";
import { FaTwitter, FaInstagram } from "react-icons/fa";
import { SiHatenabookmark } from "react-icons/si";

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
            <div className="flex justify-center gap-6 mt-4 text-2xl">
                {twitterUrl && (
                    <Link href={twitterUrl} target="_blank" rel="noopener noreferrer">
                        <FaTwitter className="text-blue-500 hover:text-blue-700 transition-transform duration-200 hover:scale-110" />
                    </Link>
                )}
                {instagramUrl && (
                    <Link href={instagramUrl} target="_blank" rel="noopener noreferrer">
                        <FaInstagram className="text-pink-500 hover:text-pink-700 transition-transform duration-200 hover:scale-110" />
                    </Link>
                )}
                {hatenaUrl && (
                    <Link href={hatenaUrl} target="_blank" rel="noopener noreferrer">
                        <SiHatenabookmark className="text-indigo-600 hover:text-indigo-800 transition-transform duration-200 hover:scale-110" />
                    </Link>
                )}
            </div>


        </div>
    );
}
