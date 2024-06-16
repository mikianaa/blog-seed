import Link from 'next/link';

const Header = () => {
    return (
        <header className="sticky top-0 border-b h-20 z-10 bg-white">
            <div className="max-w-4xl mx-auto flex justify-between items-center h-20">
                <Link href="/">
                    <div className="text-4xl font-medium">Seed</div>
                </Link>
                <div>Link</div>
            </div>
        </header>
    );
};

export default Header;