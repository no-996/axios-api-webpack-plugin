module.exports = [
  {
    name: 'posts',
    des: '帖子',
    url: '/posts',
    params: {
      userId: undefined,
    },
    children: [
      {
        name: 'comments',
        des: '评论',
        url: '/posts/{postId}/comments',
        urlParams: {
          postId: undefined,
          test: undefined,
          test2: undefined,
        },
        metadata: {
          urlParams: {
            postId: {
              name: '帖子id',
              required: true,
            },
            test2: {
              type: {
                a: '1',
                b: '2',
              },
            },
          },
        },
      },
    ],
    metadata: {
      params: {
        userId: {
          name: '用户id',
          des: '用户唯一标识',
          type: 'string',
        },
      },
    },
  },
  {
    name: 'albums',
    url: '/albums',
    des: '专辑',
    params: {
      id: undefined,
    },
    children: [],
  },
  {
    name: 'photos',
    url: '/photos',
    des: '相片',
    params: {},
    children: [],
  },
  {
    name: 'todos',
    url: '/todos',
    des: '待办事项',
    params: {},
    children: [],
  },
  {
    name: 'users',
    url: '/users',
    des: '用户',
    params: {},
    children: [],
  },
]
