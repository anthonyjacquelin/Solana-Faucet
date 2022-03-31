export default async (req, res) => {
  const url = decodeURIComponent(req.query.url);
  const result = await fetch(url);
  const body = await result.body;
//   console.log("body: ", body);
  body.pipe(res);
};
