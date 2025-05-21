import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/categories/all/1",
      permanent: false,
    },
  };
};

export default function HomeRedirect() {
  return null; // 実際には表示されることはない
}
