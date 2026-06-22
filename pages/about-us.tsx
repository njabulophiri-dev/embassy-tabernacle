import { GetServerSideProps } from "next";

export default function AboutUsRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/about",
      permanent: true,
    },
  };
};
