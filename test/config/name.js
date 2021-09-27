module.exports = {
  name: 'root',
  children: [
    {
      name: 'module01',
      children: [
        {
          name: 'module05',
          des: '模块05',
          url: '/api/05',
        },
      ],
    },
    {
      name: 'module02',
      des: '模块02',
    },
    {
      name: 'module03',
      url: '/api/03',
    },
    {
      name: 'module04',
      des: '模块04',
      url: '/api/04',
    },
  ],
}
