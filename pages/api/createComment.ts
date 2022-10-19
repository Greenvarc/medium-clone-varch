// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
const sanityClient = require('@sanity/client')
//import { sanityClient } from '../../sanity'

const config={
    dataset: process.env.NEXT_SANITY_DATASET || 'production',
    projectId: "gtvl0iny",
    apiVersion: '2021-03-25',
    useCdn: process.env.NODE_ENV === 'production',
    token:'skLAb2U7yNDloDDldwmEUwMdgJK3zoOyqPwov1rX7v6P34JKgYKraGLN6Yn0wPtfAvmjb2dRilE2I5Tv1dhnFecXN5ApCqkcLEef6oFWtrF6Eu7pvL6KH8lpvmdlJQm7xJ7bmT8aje62Yq6xcXSBs4WEtS91l9JRaT66ZW38BIvDnksOG3Y9',
}

const client=sanityClient(config)

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {_id,name,email,comment}=JSON.parse(req.body)
  try{
    await client.create({
      _type:'comment',
      post:{
        _type:'reference',
        _ref:_id,
      },
      name,
      email,
      comment
    })
  }catch(error){
    console.log(error)
    return res.status(500).json({message:'Could not submit comment',error})
  }
  console.log('comment submitted')
  res.status(200).json({ message: 'comment submitted' })
}
