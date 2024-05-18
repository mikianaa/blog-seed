import PostCard from '@/components/postcard';
import fs from 'fs';
import matter from 'gray-matter';

//型定義
export interface PostFrontMatter {
  title: string;
  date: string;
  image : String
}

export interface PostProps {
  slug: string;
  frontMatter: PostFrontMatter;
  content : String
}

interface HomeProps {
  posts: PostProps[];
}

//サーバーサイドで静的Props取得
export const getStaticProps = () => {
  const files = fs.readdirSync('posts');
  let posts = files.map((fileName) => { //受け散った配列の各要素に関数を適用する
    const slug = fileName.replace(/\.md$/, ''); // .mdを消す
    const fileContent = fs.readFileSync(`posts/${fileName}`, 'utf-8');
    const { data } = matter(fileContent); //yamlファイル先頭を解析してjson形式にする
    return {
      frontMatter: data,  
      slug,
    }
  });

  //日付が新しい順にソート
  posts = posts.sort((postA, postB) => 
    new Date(postA.frontMatter.date) > new Date(postB.frontMatter.date) ? -1 : 1);


  return {
    props: {
      posts,
    },
  };
};

export default function Home( { posts }: HomeProps) {
  return (
    <div className='my-8'>
      <div className="grid grid-cols-3 gap-4"> 
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} /> 
        ))}
      </div>
    </div>
  );
}
