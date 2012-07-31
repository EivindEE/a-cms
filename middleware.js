exports.setLocals(req, res, next) {
  res.local("currentPageName", applyFancyFormatting(req.url))
  next()
}