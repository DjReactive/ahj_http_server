const http = requaire('http');
const server = http.createServer((req, res) => {
  console.log(req);
  res.end('server resposne');
});

const port = 7070;
server.listen(port, (err) => {
  if (err) {
    console.log('Error occured:', error);
    return;
  }
  console.log(`server is listening on ${port}`);
});
