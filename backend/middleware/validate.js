import { ZodError } from "zod";



export const validate = (schema, source = "body") => (req, res, next) => {
  try {
    req[source] = schema.parse(req[source]);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    return res.status(400).json({
      message: err.message || "Validation error",
    });
  }
};