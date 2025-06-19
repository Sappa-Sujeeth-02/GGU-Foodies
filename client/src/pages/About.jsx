import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HiOutlineUsers, HiOutlineLightBulb, HiOutlineStar } from 'react-icons/hi';

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            About GGU Foodies
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            We're revolutionizing the way students at Godavari Global University experience dining by offering a seamless pre-ordering platform.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                                Our Story
                            </h2>
                            <p className="text-gray-600 mb-4">
                                GGU Foodies was founded in 2025 by two students at Godavari Global University who wanted to solve a common problem: long waiting times at campus food courts. We envisioned a platform that allows students to pre-order their meals, skip the queues, and enjoy their food without the hassle.
                            </p>
                            <p className="text-gray-600">
                                Today, GGU Foodies partners with the university's top food courts to offer a diverse range of cuisines, ensuring that every student can find something they love. Our mission is to make dining on campus more convenient, efficient, and enjoyable.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <img
                                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600"
                                alt="GGU Foodies Team"
                                className="rounded-2xl shadow-2xl w-full h-auto"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Our Values Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Our Values
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We are committed to delivering exceptional service through innovation, quality, and customer satisfaction.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[{
                            Icon: HiOutlineUsers,
                            title: "Customer First",
                            description: "We prioritize our users' needs by providing a seamless and intuitive platform to enhance their dining experience."
                        }, {
                            Icon: HiOutlineLightBulb,
                            title: "Innovation",
                            description: "We continuously innovate to bring the latest technology and features to make pre-ordering as efficient as possible."
                        }, {
                            Icon: HiOutlineStar,
                            title: "Quality",
                            description: "We partner with food courts that maintain the highest standards of quality and hygiene."
                        }].map(({ Icon, title, description }, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 * index }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Icon className="w-8 h-8 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
                                <p className="text-gray-600">{description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Our Team
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Meet the dedicated team behind GGU Foodies, working to make your dining experience exceptional.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {[
                            { name: "J.V. Rajiv Chaitanya", role: "Founder", image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=128&h=128" },
                            { name: "S. Sujeeth", role: "Founder", image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=128&h=128" }
                        ].map(({ name, role, image }, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                                className="text-center"
                            >
                                <img
                                    src={image}
                                    alt={name}
                                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                                />
                                <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
                                <p className="text-gray-600">{role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;