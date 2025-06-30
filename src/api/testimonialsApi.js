import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const testimonialsApi = createApi({
  reducerPath: 'testimonialsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access-token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('Accept', 'application/json')
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Testimonial'],
  endpoints: (builder) => ({
    getTestimonials: builder.query({
      query: () => '/testimonials',
      providesTags: ['Testimonial'],
    }),
    addTestimonial: builder.mutation({
      query: (testimonial) => ({
        url: '/testimonials',
        method: 'POST',
        body: testimonial,
      }),
      invalidatesTags: ['Testimonial'],
    }),
    // Admin endpoints
    getAdminTestimonials: builder.query({
      query: (status = 'all') => `/admin/testimonials?status=${status}`,
      providesTags: ['Testimonial'],
    }),
    updateTestimonialStatus: builder.mutation({
      query: ({ id, status ,rating}) => ({
        url: `/admin/testimonials/${id}/status`,
        method: 'PATCH',
        body: { status, rating},
      }),
      invalidatesTags: ['Testimonial'],
    }),
    deleteTestimonial: builder.mutation({
      query: (id) => ({
        url: `/admin/testimonials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Testimonial'],
    }),
  }),
})

export const {
  useGetTestimonialsQuery,
  useAddTestimonialMutation,
  useGetAdminTestimonialsQuery,
  useUpdateTestimonialStatusMutation,
  useDeleteTestimonialMutation,
} = testimonialsApi
