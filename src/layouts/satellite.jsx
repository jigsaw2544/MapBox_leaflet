export const satellite = {
    url: `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${import.meta.env.VITE_API_MAPTILER_KEY}`,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors',
};
