// 初始化数据变量
// 储存初始所有数据
let dataLocal = null;
// 类型集合
let categories = null;
// 标签集合
let tags = null;
// 抽取标签集合
let titles = null;

const filterTags = function () {
  // 使用 Set 存储唯一类别和标签
  const categorySet = new Set();
  const tagsSet = new Set();
  const titleSet = new Set();

  if (Array.isArray(dataLocal)) {
    // 遍历游戏数据数组
    dataLocal.forEach(game => {
      // 添加类别到 categorySet
      if (game.category) {
        categorySet.add(game.category.trim());
      }
      if (game.title) {
        titleSet.add(game.title.trim());
      }
      // 拆分 tags 字符串并添加到 tagsSet
      if (game.tags) {
        game.tags.split(',').forEach(tag => {
          tagsSet.add(tag.trim());
        });
      }

    });

    categories = Array.from(categorySet);
    titles = Array.from(titleSet);
    tags = Array.from(tagsSet);

    // 输出处理结果
    // console.log('Categories:', categories);
    // console.log('Tags:', tags);
    // console.log('title:', titles.slice(250, 380));
  } else {
    console.error('dataLocal is not an array');
  }
}

// 获取 JSON 数据并处理
function getDataAll (url = './originfreegames.json') {
  return new Promise((reslove, reject) => {
    if (dataLocal) {
      reslove(dataLocal)
    } else {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // 处理 JSON 数据
          dataLocal = data;
          // 过滤初始化状态标签
          reslove(data)
        })
        .catch(error => console.error('Error loading JSON:', error));
    }
  })
}
// interFace pram = {
//   Categorie: string,
//   tag: string
// }
// 遍历pram 交集筛选
function getDataPage (page, perPage, pram, data) {
  let dataAll = data || dataLocal;

  // 确保分页参数有效性 
  if (page < 1 || perPage < 1) {
    throw new Error("Page number and items per page must be greater than 0.");
  }

  // 先根据 pram 对象进行筛选
  if (pram && typeof pram === 'object') {
    dataAll = dataAll.filter(item => {
      return Object.keys(pram).every(key => {
        if (pram[key] === 'all') {
          // 如果 pram[key] 为 'all'，则跳过该 key 的筛选
          return true;
        }
        if (pram[key] && item[key]) {
          // 比较 key 的值（忽略大小写和空白）
          return item[key].toString().trim().toLowerCase() === pram[key].toString().trim().toLowerCase();
        }
        return false;
      });
    });
  }

  // 计算分页信息
  const totalItems = dataAll.length; // 总数据量
  const totalPages = Math.ceil(totalItems / perPage); // 总页数

  if (page > totalPages) {
    return [];
  }

  // 计算起始和结束索引
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  // 返回当前页的数据
  return dataAll.slice(startIndex, endIndex);
}
// 按类型整理的数据
function categorizeData (num = 12, datas) {
  return new Promise((resolve, reject) => {
    const filterDatas = (datas) => {
      const res = {}
      datas.forEach(item => {
        res[item.category] = res[item.category] || []
        if (res[item.category].length < num) {
          res[item.category].push(item)
        }
      })
      resolve(res)
    }
    const getData = () => {
      if (!datas) {
        getDataAll().then(res => {
          filterDatas(res)
        })
      }else {
        filterDatas(datas)
      }
    }
    getData()
  })
}

export { getDataAll, categorizeData }