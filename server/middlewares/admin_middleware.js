module.exports = (req, res, next) => {
  if (req.userData && req.userData.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admins only" });
  }
};
