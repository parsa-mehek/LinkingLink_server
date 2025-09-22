export function validate(schema) {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (e) {
            const z = e;
            return res.status(400).json({ error: 'ValidationError', details: z.errors });
        }
    };
}
