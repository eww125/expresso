/*
// database is let instead of const to allow us to modify it in test.js
let database = {
  users: {},
  articles: {},
  comments: {},
  nextArticleId: 1,
  nextCommentId: 1
};

//let articles = {

//}

function viewDatabase() {
  console.log('\n')
  console.log('database_keys=' + Object.keys(database))
  console.log('database.users_keys=' + Object.keys(database.users))
  console.log('database.articles_keys=' + Object.keys(database.articles))
  console.log('database.comments_keys=' + Object.keys(database.comments))
  console.log('database.nextArticleId=' + database.nextArticleId)
  console.log('database.nextCommentId=' + database.nextCommentId)
  console.log('\n')
}







const routes = {
  '/users': {
    'POST': getOrCreateUser //function getOrCreateUser(url, request)
  },
  '/users/:username': {
    'GET': getUser //function getUser(url, request)
  },
  '/articles': {
    'GET': getArticles, //function getArticles(url, request)
    'POST': createArticle //function createArticle(url, request)
  },
  '/articles/:id': {
    'GET': getArticle, //function getArticle(url, request)
    'PUT': updateArticle, //function updateArticle(url, request)
    'DELETE': deleteArticle //function deleteArticle(url, request)
  },
  '/articles/:id/upvote': {
    'PUT': upvoteArticle //function upvoteArticle(url, request)
  },
  '/articles/:id/downvote': {
    'PUT': downvoteArticle //function downvoteArticle(url, request)
  },
  '/comments': {
    'POST': createComment

  },
  '/comments/:id': {
    'PUT': updateComment,
    'DELETE': deleteComment

  },
  '/comments/:id/upvote': {
    'PUT': upvoteComment //function upvoteComment(url, request)
  },
  '/comments/:id/downvote': {
    'PUT': downvoteComment //function downvoteComment(url, request)
  }
};

function getUser(url, request) {
  const username = url.split('/').filter(segment => segment)[1];
  const user = database.users[username];
  const response = {};

  if (user) {
    const userArticles = user.articleIds.map(
        articleId => database.articles[articleId]);
    const userComments = user.commentIds.map(
        commentId => database.comments[commentId]);
    response.body = {
      user: user,
      userArticles: userArticles,
      userComments: userComments
    };
    response.status = 200;
  } else if (username) {
    response.status = 404;
  } else {
    response.status = 400;
  }

  return response;
}

function getOrCreateUser(url, request) {
  const username = request.body && request.body.username;
  const response = {};
  console.log('username=' + username)

  if (database.users[username]) {
    response.body = {user: database.users[username]};
    response.status = 200;
  } else if (username) {
    const user = {
      username: username,
      articleIds: [],
      commentIds: []
    };
    database.users[username] = user;
    response.body = {user: user};
    response.status = 201;
  } else {
    response.status = 400;
  }

  return response;
}

function getArticles(url, request) {
  const response = {};

  response.status = 200;
  response.body = {
    articles: Object.keys(database.articles)
        .map(articleId => database.articles[articleId])
        .filter(article => article)
        .sort((article1, article2) => article2.id - article1.id)
  };

  return response;
}

function getArticle(url, request) {
  const id = Number(url.split('/').filter(segment => segment)[1]);
  const article = database.articles[id];
  const response = {};

  if (article) {
    article.comments = article.commentIds.map(
      commentId => database.comments[commentId]);

    response.body = {article: article};
    response.status = 200;
  } else if (id) {
    response.status = 404;
  } else {
    response.status = 400;
  }

  return response;
}

function createArticle(url, request) {
  const requestArticle = request.body && request.body.article;
  console.log('requestArticle = ' + requestArticle)
  const response = {};

  if (requestArticle && requestArticle.title && requestArticle.url &&
      requestArticle.username && database.users[requestArticle.username]) {
    const article = {
      id: database.nextArticleId++,
      title: requestArticle.title,
      url: requestArticle.url,
      username: requestArticle.username,
      commentIds: [],
      upvotedBy: [],
      downvotedBy: []
    };

    console.log('article=' + article)
    console.log('article_keys=' + Object.keys(article));
    console.log('article.id=' + article.id);
    console.log('article.title=' + article.title);
    console.log('article.url=' + article.url);
    console.log('article.username=' + article.username);
    console.log('article.commentIDs=' + article.commentIDs);
    console.log('article.upvotedBy=' + article.upvotedBy);
    console.log('article.downvotedBy=' + article.downvotedBy);

    database.articles[article.id] = article;
    database.users[article.username].articleIds.push(article.id);

    response.body = {article: article};
    response.status = 201;
  } else {
    response.status = 400;
  }

  return response;
}

function updateArticle(url, request) {
  const id = Number(url.split('/').filter(segment => segment)[1]);
  const savedArticle = database.articles[id];
  const requestArticle = request.body && request.body.article;
  const response = {};

  if (!id || !requestArticle) {
    response.status = 400;
  } else if (!savedArticle) {
    response.status = 404;
  } else {
    savedArticle.title = requestArticle.title || savedArticle.title;
    savedArticle.url = requestArticle.url || savedArticle.url;

    response.body = {article: savedArticle};
    response.status = 200;
  }

  return response;
}

function deleteArticle(url, request) {
  const id = Number(url.split('/').filter(segment => segment)[1]);
  const savedArticle = database.articles[id];
  const response = {};

  if (savedArticle) {
    database.articles[id] = null;
    savedArticle.commentIds.forEach(commentId => {
      const comment = database.comments[commentId];
      database.comments[commentId] = null;
      const userCommentIds = database.users[comment.username].commentIds;
      userCommentIds.splice(userCommentIds.indexOf(id), 1);
    });
    const userArticleIds = database.users[savedArticle.username].articleIds;
    userArticleIds.splice(userArticleIds.indexOf(id), 1);
    response.status = 204;
  } else {
    response.status = 400;
  }

  return response;
}

function upvoteArticle(url, request) {
  const id = Number(url.split('/').filter(segment => segment)[1]);
  const username = request.body && request.body.username;
  let savedArticle = database.articles[id];
  const response = {};

  if (savedArticle && database.users[username]) {
    savedArticle = upvote(savedArticle, username);

    response.body = {article: savedArticle};
    response.status = 200;
  } else {
    response.status = 400;
  }

  return response;
}

function downvoteArticle(url, request) {
  const id = Number(url.split('/').filter(segment => segment)[1]);
  const username = request.body && request.body.username;
  let savedArticle = database.articles[id];
  const response = {};

  if (savedArticle && database.users[username]) {
    savedArticle = downvote(savedArticle, username);

    response.body = {article: savedArticle};
    response.status = 200;
  } else {
    response.status = 400;
  }

  return response;
}

function upvote(item, username) {
  if (item.downvotedBy.includes(username)) {
    item.downvotedBy.splice(item.downvotedBy.indexOf(username), 1);
  }
  if (!item.upvotedBy.includes(username)) {
    item.upvotedBy.push(username);
  }
  return item;
}

function downvote(item, username) {
  if (item.upvotedBy.includes(username)) {
    item.upvotedBy.splice(item.upvotedBy.indexOf(username), 1);
  }
  if (!item.downvotedBy.includes(username)) {
    item.downvotedBy.push(username);
  }
  return item;
}

function createComment(url, request) {

/*
  console.log('url=' + url)
  console.log('request=' + request)
  console.log('request_keys=' + Object.keys(request))
  console.log('request.body=' + request.body)
  console.log('request.body_keys=' + Object.keys(request.body))
  console.log('request.body.comment=' + request.body.comment)
  console.log('request.body.comment_keys=' + Object.keys(request.body.comment))
  console.log('request.body.comment.body=' + request.body.comment.body) //working
  console.log('request.body.comment.articleID=' + request.body.comment.articleID)
  console.log('request.body.comment.username=' + request.body.comment.username)


  const response = {};
  const comment = {
    id: database.nextCommentId++,
    body: request.body.comment.body,
    username: request.body.comment.username,
    articleId: request.body.comment.articleID,
    upvotedBy: [],
    downvotedBy: []
  };
/*
  console.log('comment_keys=' + Object.keys(comment));
  console.log('comment.id=' + comment.id);
  console.log('comment.body=' + comment.body);
  console.log('comment.username=' + comment.username);
  console.log('comment.articleID=' + comment.articleID);
  console.log('comment.upvotedBy=' + comment.upvotedBy);
  console.log('comment.downvotedBy=' + comment.downvotedBy);


  database.comments[comment.id] = comment;

  response.body = {comment: comment};
  response.status = 201;
  return response
  //return comment

  //if (body isn't supplied || user with supplied username doesn't exist || article with supplied article ID does not exist) {
    //response.status = '400'
}


function updateComment(url, request) {
  const response = {};
  response.statusCode = 200;
  return response
}

function deleteComment(url, request) {
  const response = {};
  response.statusCode = 200;
  return response
}

function upvoteComment(item, username) {

}

function downvoteComment(item, username) {

}


// Write all code above this line.
*/
const http = require('http');
const url = require('url');

const port = process.env.PORT || 4000;
const isTestMode = process.env.IS_TEST_MODE;



const requestHandler = (request, response) => {

}

/*


  console.log('requestHandler')
  viewDatabase()




  const url = request.url;
  const method = request.method;
  const route = getRequestRoute(url);
  //console.log('url=' + url)
  //console.log('method=' + method)
  //console.log('route=' + route)

  if (method === 'OPTIONS') {
    var headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = false;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
    response.writeHead(200, headers);
    return response.end();
  }

  response.setHeader('Access-Control-Allow-Origin', null);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader(
      'Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  if (!routes[route] || !routes[route][method]) {
    response.statusCode = 400;
    return response.end();
  }

  if (method === 'GET' || method === 'DELETE') {
    const methodResponse = routes[route][method].call(null, url);
    !isTestMode && (typeof saveDatabase === 'function') && saveDatabase();

    response.statusCode = methodResponse.status;
    response.end(JSON.stringify(methodResponse.body) || '');
  } else {
    let body = [];
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = JSON.parse(Buffer.concat(body).toString());
      const jsonRequest = {body: body};
      const methodResponse = routes[route][method].call(null, url, jsonRequest);
      !isTestMode && (typeof saveDatabase === 'function') && saveDatabase();

      response.statusCode = methodResponse.status; //crashing here
      response.end(JSON.stringify(methodResponse.body) || '');
    });
  }
};

const getRequestRoute = (url) => {
  const pathSegments = url.split('/').filter(segment => segment);

  if (pathSegments.length === 1) {
    return `/${pathSegments[0]}`;
  } else if (pathSegments[2] === 'upvote' || pathSegments[2] === 'downvote') {
    return `/${pathSegments[0]}/:id/${pathSegments[2]}`;
  } else if (pathSegments[0] === 'users') {
    return `/${pathSegments[0]}/:username`;
  } else {
    return `/${pathSegments[0]}/:id`;
  }
}

if (typeof loadDatabase === 'function' && !isTestMode) {
  const savedDatabase = loadDatabase();
  if (savedDatabase) {
    for (key in database) {
      database[key] = savedDatabase[key] || database[key];
    }
  }
}
*/
const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('Server did not start succesfully: ', err);
  }

  console.log(`Server is listening on ${port}`);
});
