import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    // Log the entire Authorization header for debugging
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', authHeader);

    // Check if the header existsH and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No Bearer token or Authorization header missing');
        return res.status(401).json({ success: false, message: 'Not authorized. Login again' });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token);  // Log the extracted token

    try {
        // Verify the token using the JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded); // Log the decoded token

        // Attach the userId to the request object
        req.body.userId = decoded.id;
        next(); // Proceed to the next middleware
    } catch (error) {
        console.log('JWT Error:', error.message); // Log the error message if token is invalid
        res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
    }
};

export default authMiddleware;
