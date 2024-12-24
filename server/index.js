const {
  client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite,
  authenticate,
  findUserWithToken,
} = require("./db");
const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();

app.use(express.json());

// Serve static files for deployment
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);
app.use(
  "/assets",
  express.static(path.join(__dirname, "../client/dist/assets"))
);

// Auth Routes
app.post("/api/auth/login", async (req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw Error("Username and password are required");
    }
    const user = await createUser({ username, password });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.status(201).send({ token });
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth/me", async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    res.send(await findUserWithToken(token));
  } catch (ex) {
    next(ex);
  }
});

// Users and Favorites Routes
app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const loggedInUser = await findUserWithToken(token);
    if (loggedInUser.id !== req.params.id) {
      throw Error("Unauthorized access");
    }
    res.send(await fetchFavorites(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const loggedInUser = await findUserWithToken(token);
    if (loggedInUser.id !== req.params.id) {
      throw Error("Unauthorized access");
    }
    res
      .status(201)
      .send(
        await createFavorite({
          user_id: req.params.id,
          product_id: req.body.product_id,
        })
      );
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:user_id/favorites/:id", async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const loggedInUser = await findUserWithToken(token);
    if (loggedInUser.id !== req.params.user_id) {
      throw Error("Unauthorized access");
    }
    await destroyFavorite({ user_id: req.params.user_id, id: req.params.id });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .send({ error: err.message || "Internal Server Error" });
});

// Initialize and Start Server
const init = async () => {
  const port = process.env.PORT || 3000;
  await client.connect();
  console.log("Connected to database");

  await createTables();
  console.log("Tables created");

  const [moe, lucy, ethyl, curly, foo, bar, bazz, quq, fip] = await Promise.all([
    createUser({ username: 'moe', password: 'm_pw'}),
    createUser({ username: 'lucy', password: 'l_pw'}),
    createUser({ username: 'ethyl', password: 'e_pw'}),
    createUser({ username: 'curly', password: 'c_pw'}),
    createProduct({ name: 'foo' }),
    createProduct({ name: 'bar' }),
    createProduct({ name: 'bazz' }),
    createProduct({ name: 'quq' }),
    createProduct({ name: 'fip' })
  ]);

  console.log(await fetchUsers());
  console.log(await fetchProducts());

  console.log(await fetchFavorites(moe.id));
  const favorite = await createFavorite({ user_id: moe.id, product_id: foo.id 

  app.listen(port, () => console.log(`listening on port ${port}`));
}};

init();