# astro-maplibre-template
basic template for astro and maplibre.

## Inline
Inline maps using MDX are shown in the `inline_maps.mdx` file in `/pages`. Within the `<Container />` object you can use traditional markdown as well as the MDX `Maplibre` object. You can pass styles and layers to the map. It would be good to be able to pass the option to control layer visibility and onClick behavior from the layers arg that's passed in as well, to come.

## Scrollytelling
Uses a YAML convention to pass arguments to the map object. Steps are defined in `pages/scrollytelling_steps.yaml`, which is invoked in `payes/scrolltelling.mdx`. That's where the initial position and map style should be defined. Otherwise text, images, etc. should be defined in the yaml file. I'd like to continue to add features to the steps, including passing the hidden variable, animation control, and more layer control. This is just a matter of copying the mapbox scrollytelling logic over. 

## Full page
It would be nice to add a full-page view for anyone making a dashboard-style map. For this it would be important to get layer control and click/hover interaction settings working properly. No progress on this to-date.
