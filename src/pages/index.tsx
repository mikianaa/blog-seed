import fs from 'fs';
import matter from 'gray-matter';

//型定義
interface PostFrontMatter {
  title: string;
  date: string;
}

interface Post {
  slug: string;
  frontMatter: PostFrontMatter;
}

interface HomeProps {
  posts: Post[];
}

//サーバーサイドで静的Props取得
export const getStaticProps = () => {
  const files = fs.readdirSync('posts');
  const posts = files.map((fileName) => {
    const slug = fileName.replace(/\.md$/, ''); // .mdを消す
    const fileContent = fs.readFileSync(`posts/${fileName}`, 'utf-8');
    const { data } = matter(fileContent);
    return {
      frontMatter: data, 
      slug
    }
  });

  return {
    props: {
      posts,
    },
  };
};

//Todo: ここのPropsの渡され方について調べる
export default function Home( { posts }: HomeProps) {
  console.log(posts);
  return (
    <div className='my-8'>コンテンツ</div>
  );
}
