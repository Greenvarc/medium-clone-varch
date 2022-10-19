import { GetStaticProps } from "next";
import Header from "../../components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Comment, Post } from "../../typing";

import { useForm, SubmitHandler } from "react-hook-form";

import PortableText from "react-portable-text";
import { useState } from "react";

interface FormData {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

interface Props {
  post: Post;
}

function Post({ post }: Props) {
  const [submited, setSubmited] = useState(false);
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  //post comment
  const onSubmit = handleSubmit(async (data) => {
    await fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => {
        setSubmited(true);
        console.log(data);
      })
      .catch((error) => {
        setSubmited(false);
        console.log(error);
      });
  });

  return (
    <main>
      <Header />
      <img
        className="w-full h-60 object-cover"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />

      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>

        <h2 className="text-xl font-light text-gray-500 ">{post.desciption}</h2>

        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()}
            alt=""
          />
          <p className="font-extralight text-sw">
            Blog post by{" "}
            <span className="text-green-600">{post.author.name}</span> -
            Published at {new Date(post._createAt).toLocaleString()}
          </p>
        </div>
        <div>
          <PortableText
            dataset={process.env.NEXT_SANITY_DATASET}
            projectId={process.env.NEXT_SANITY_ID}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="text-2xl font-bold my-5" {...props} />
              ),
              h2: (props: any) => (
                <h1 className="text-xl font-bold my-5" {...props} />
              ),
              li: (props: any) => <li className="ml-4 list-disc" {...props} />,
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
              image: (props: any) => (
                <img className="h-xl w-1xl mt-6" src={urlFor(props).url()} />
              ),
            }}
          />
        </div>
      </article>

      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />
      {submited ? (
        <div className="flex flex-col py-10 my-10 border bg-yellow-500 text-white max-w-2xl mx-auto">
          <h3 className="text-3xl text-center font-bold ">
            Thank you for submiting comment,
          </h3>
          <p className="text-center">Once aprouved, it will appear below</p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex flex-col p-5 max-w-2xl mx-auto mb-10"
        >
          <h4 className="text-3xl font-bold">Leave a comment below </h4>
          {/* id ninput ../. */}
          <input
            {...register("_id")}
            type="hidden"
            name="_id"
            value={post._id}
          />

          <label className="block mb-5 " htmlFor="">
            <span className="text-gray-700">Name</span>
            <input
              {...register("name", { required: true })}
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
              placeholder="Green Varch"
              type="text"
            />
          </label>
          <label className="block mb-5 " htmlFor="">
            <span className="text-gray-700">Email</span>
            <input
              {...register("email", { required: true })}
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
              placeholder="green@gmail.com"
              type="email"
            />
          </label>
          <label className="block mb-5 " htmlFor="">
            <span className="text-gray-700">Comments</span>
            <textarea
              {...register("comment", { required: true })}
              className="shadow border rounded py-2 px-3 form-textarea block w-full ring-yellow-500 outline-none focus:ring"
              placeholder="comments ../."
              rows={8}
            />
          </label>

          <div className="flex flex-col p5">
            {errors.name && (
              <span className="text-red-500"> The name field is required </span>
            )}
            {errors.comment && (
              <span className="text-red-500">
                The comment field is required{" "}
              </span>
            )}
            {errors.email && (
              <span className="text-red-500">
                {" "}
                The email field is required{" "}
              </span>
            )}
          </div>
          <input
            type="submit"
            className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline outline-none text-white font-bold py-2 px-4 rounded cursor-pointer"
          />
        </form>
      )}
      {/* comments */}
      <div className="flex flex-col p-10 my-10 mx-auto shadow-yellow-500 shadow space-y-2">
        <h3 className="text-4xl">Comments </h3>
        <hr className="pb-2" />
        {post.comments.map(({ _id, name, email }) => (
          <div key={_id}>
            <p>
              <span className="text-yellow-500">{name}:</span>
              {email}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Post;

export const getStaticPaths = async () => {
  const query = `*[_type=='post']{
      _id,
      slug,
    }`;
  const posts = await sanityClient.fetch(query);
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));
  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type=="post" && slug.current==$slug][0]{
    _id,
    _createAt,
    title,
    author->{
      name,
      image,
    },
    'comments':*[
      _type=="comment" &&
      post._ref==^._id &&
      approuved==true],
    description,
    mainImage,
    slug,
    body
  }`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 60, // update page after 60s  cache , re-render ,...
  };
};
