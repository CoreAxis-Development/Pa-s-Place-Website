import React from 'react';
import { Calendar, Home, Banknote } from 'lucide-react';

const Pricing = () => {
    return (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Our Pricing</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Event Hire Card */}
                    <div
                        className="relative rounded-xl overflow-hidden shadow-xl"
                        style={{
                            backgroundImage: "url('https://source.unsplash.com/1600x900/?celebration,event')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-purple-700/70" />
                        <div className="relative p-8 text-center text-white h-full flex flex-col justify-between">
                            <div>
                                <div className="flex justify-center mb-4">
                                    <Calendar className="h-16 w-16" />
                                </div>
                                <h3 className="text-2xl font-bold mb-6">Event Hire</h3>
                                <div className="text-5xl font-bold mb-2">R80<span className="text-xl font-normal">/person</span></div>
                                <ul className="text-lg space-y-2 mb-6">
                                    <li>Minimum 10 people (R800)</li>
                                    <li>R500 deposit required for reservation</li>
                                    <li>Full venue access</li>
                                    <li>Access to entertainment facilities</li>
                                </ul>
                            </div>
                            <Banknote className="h-8 w-8 mx-auto opacity-70" />
                        </div>
                    </div>

                    {/* Accommodation Card */}
                    <div
                        className="relative rounded-xl overflow-hidden shadow-xl"
                        style={{
                            backgroundImage: "url('https://source.unsplash.com/1600x900/?beach,bedroom')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-blue-700/70" />
                        <div className="relative p-8 text-center text-white h-full flex flex-col justify-between">
                            <div>
                                <div className="flex justify-center mb-4">
                                    <Home className="h-16 w-16" />
                                </div>
                                <h3 className="text-2xl font-bold mb-6">Accommodation</h3>
                                <div className="text-5xl font-bold mb-2">R200<span className="text-xl font-normal">/person/night</span></div>
                                <ul className="text-lg space-y-2 mb-6">
                                    <li>Minimum 4 people (R850)</li>
                                    <li>Comfortable bedding</li>
                                    <li>Modern facilities</li>
                                    <li>Secure premises</li>
                                </ul>
                            </div>
                            <Banknote className="h-8 w-8 mx-auto opacity-70" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;