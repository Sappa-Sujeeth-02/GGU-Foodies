import { motion } from 'framer-motion';

const LoadingPage = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <div className="text-4xl sm:text-5xl font-bold flex items-center space-x-2">
                <motion.span
                    className="text-red-600"
                    initial={{ y: 0 }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                >
                    G
                </motion.span>
                <motion.span
                    className="text-red-600"
                    initial={{ y: 0 }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.1 }}
                >
                    G
                </motion.span>
                <motion.span
                    className="text-red-600"
                    initial={{ y: 0 }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                >
                    U
                </motion.span>
                <motion.span className="text-gray-800">Foodies</motion.span>
            </div>

            <div className="mt-6 w-12 h-12 border-4 border-red-600 border-dashed rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Waking up the server, please wait...</p>
        </div>
    );
};

export default LoadingPage;
