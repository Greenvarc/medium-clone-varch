import {
    createClient,
    createPreviewSubscriptionHook,
    createCurrentUserHook
} from 'next-sanity';
import createImageUrlBuilder from '@sanity/image-url'
//import { PortableText as PortableTextComponent } from '@portabletext/react'

const config={
    dataset: process.env.NEXT_SANITY_DATASET || 'production',
    projectId:process.env.NEXT_SANITY_ID || 'gtvl0iny',
    apiVersion: '2021-03-25',
    useCdn: process.env.NODE_ENV === 'production'
    // token: '<sanity access token>',
    // EventSource:""
}

export const sanityClient=createClient(config);
export const urlFor=(source)=>createImageUrlBuilder(config).image(source)
export const useCurrentUser=createCurrentUserHook(config)