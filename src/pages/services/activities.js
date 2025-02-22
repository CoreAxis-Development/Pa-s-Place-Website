import React from 'react';
import Header from '@/components/Header';
import { Waves, Bike, Sun, Dumbbell, Users, Trees } from 'lucide-react';

const Activities = () => {
    return (
        <>
            <Header />
            {/* Hero Section */}
            <section className="relative">
                <div
                    className="h-[70vh] bg-cover bg-center"
                    style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?beach,sports')" }}
                >
                    <div className="bg-black bg-opacity-50 h-full flex flex-col justify-center items-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white text-center">Adventure & Activities</h1>
                        <p className="text-white text-xl mt-4 px-4 text-center max-w-2xl">
                            From beachside adventures to fitness training, discover a world of activities at Pa's Place
                        </p>
                    </div>
                </div>
            </section>

            {/* Activity Categories */}
            <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-4">
                                <Waves className="h-8 w-8 text-blue-600 mr-3" />
                                <h3 className="text-xl font-bold">Water Activities</h3>
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Swimming at Nkomba Beach</li>
                                <li>• Beginner surfing lessons</li>
                                <li>• Beach volleyball</li>
                                <li>• Safe swimming areas for kids</li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-4">
                                <Dumbbell className="h-8 w-8 text-green-600 mr-3" />
                                <h3 className="text-xl font-bold">Fitness & Sports</h3>
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Boxing equipment</li>
                                <li>• Outdoor fitness area</li>
                                <li>• Training equipment</li>
                                <li>• Guided workout sessions</li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-4">
                                <Sun className="h-8 w-8 text-yellow-600 mr-3" />
                                <h3 className="text-xl font-bold">Outdoor Fun</h3>
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Adventure slides</li>
                                <li>• Trampoline park</li>
                                <li>• Mini putt-putt course</li>
                                <li>• Playground equipment</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Activities */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Featured Activities</h2>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div
                            className="relative h-64 rounded-xl overflow-hidden"
                            style={{
                                backgroundImage: "url('https://source.unsplash.com/1600x900/?boxing,gym')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                                <h3 className="text-2xl font-bold text-white mb-2">Fitness Center</h3>
                                <p className="text-white">
                                    State-of-the-art boxing equipment and training facilities for all skill levels
                                </p>
                            </div>
                        </div>

                        <div
                            className="relative h-64 rounded-xl overflow-hidden"
                            style={{
                                backgroundImage: "url('https://source.unsplash.com/1600x900/?waterslide,pool')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                                <h3 className="text-2xl font-bold text-white mb-2">Adventure Slides</h3>
                                <p className="text-white">
                                    Exciting slides and water features for endless family fun
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Activities?</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">All Ages Welcome</h3>
                            <p className="text-gray-600">Activities designed for everyone, from kids to adults</p>
                        </div>

                        <div className="text-center">
                            <Trees className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Natural Setting</h3>
                            <p className="text-gray-600">Beautiful beachside location with stunning views</p>
                        </div>

                        <div className="text-center">
                            <Bike className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Active Lifestyle</h3>
                            <p className="text-gray-600">Promote health and wellness through varied activities</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Your Adventure?</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Join us at Pa's Place for an unforgettable experience filled with fun, fitness, and adventure.
                    </p>
                    <p className="text-gray-700 font-semibold">
                        Contact us to learn more about our activities and programs
                    </p>
                </div>
            </section>
        </>
    );
};

export default Activities;