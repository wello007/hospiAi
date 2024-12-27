const asyncValidation = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.validateAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }
  };
};

module.exports = asyncValidation; 