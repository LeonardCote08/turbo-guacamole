# Emotion Weather - Miniature Earth Visualization

A sophisticated 3D Earth visualization with tilt-shift depth of field effect, creating a miniature diorama aesthetic. Features real geographic data rendering, interactive globe rotation, dual DOF rendering modes, and extensive debug controls for fine-tuning the visual experience.

## Overview

Emotion Weather transforms a realistic Earth into a charming miniature diorama using advanced post-processing effects. The project uses Three.js r128 with custom shaders to achieve a tilt-shift photography effect, making the Earth appear as a tiny model floating in space. The globe can be interactively rotated by clicking and dragging, providing an intuitive, tactile experience similar to spinning a physical globe.

## Features

### Core Functionality
- **Interactive Globe Rotation**: Click and drag to manually rotate the Earth
- **Momentum Physics**: Globe continues spinning with realistic deceleration after release
- **Auto-rotation**: Automatic rotation resumes after interaction stops
- **Real Geographic Data**: Uses Natural Earth GeoJSON data for accurate continent and island shapes
- **Fallback System**: Simplified geographic data loads automatically if GeoJSON fails (CORS issues)
- **Dual DOF Modes**: Switch between BokehPass and SimpleDOF implementations
- **Tilt-Shift Effect**: Advanced depth of field with customizable parameters
- **Manual Value Input**: Direct numerical input for precise parameter control
- **Dynamic Focus**: Optional mouse-controlled focus with vertical movement
- **Touch Support**: Full mobile/tablet interaction support

### Visual Features
- **Smooth Earth Texture**: Procedurally generated with realistic continent shapes
- **Atmospheric Effects**: Glowing atmosphere and subtle haze
- **Cloud Layer**: Semi-transparent cloud coverage
- **Stylized Lighting**: Multiple light sources for soft, even illumination
- **Color Grading**: Enhanced saturation and vignetting for miniature effect
- **Star Field**: Surrounding space environment with 3000+ stars
- **Hover Effects**: Visual feedback when mouse is over the globe

### Technical Features
- **Post-Processing Pipeline**: EffectComposer with multiple passes
- **Optimized Performance**: Adaptive quality and efficient rendering
- **Debug Interface**: Comprehensive controls with real-time feedback
- **Test Objects**: Colored spheres at various depths for DOF testing
- **CORS Handling**: Automatic fallback for local file access issues
- **Responsive Design**: Adapts to all screen sizes

## File Structure

```
emotion-weather/
├── index.html                    # Main HTML with enhanced UI and interaction hints
├── data/
│   └── ne_110m_land.json        # Natural Earth geographic data (optional)
├── js/
│   ├── app.js                   # Main application with globe interaction
│   ├── earthTextureGenerator.js # Procedural Earth texture generation
│   ├── geoJsonLoader.js         # GeoJSON data loader with fallback
│   ├── simplifiedGeoData.js     # Embedded geographic data (fallback)
│   └── postProcessing.js        # BokehPass & SimpleDOF implementations
├── README.md                    # This file
└── .gitignore
```

## Installation & Setup

### Option 1: Local HTTP Server (Recommended)

To avoid CORS issues when loading GeoJSON data, run a local HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if http-server is installed)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

### Option 2: Direct File Access

Simply open `index.html` in your browser. The application will automatically use simplified geographic data if it encounters CORS errors loading the GeoJSON file.

### Option 3: Web Server

Upload all files to any web server maintaining the directory structure.

## Geographic Data

The project supports two data sources:

1. **Natural Earth Data** (`data/ne_110m_land.json`):
   - High-quality, accurate geographic boundaries
   - 110m resolution (simplified for performance)
   - Includes all continents and major islands
   - Download from: https://www.naturalearthdata.com/

2. **Simplified Fallback Data** (`js/simplifiedGeoData.js`):
   - Embedded directly in JavaScript
   - Loads automatically if GeoJSON fails
   - Simplified but recognizable continent shapes
   - No external dependencies

## Controls

### Mouse Interaction
- **Click and Drag on Globe**: Rotate the Earth manually
- **Release**: Globe continues with momentum and gradually slows down
- **Hover**: Cursor changes to indicate interactivity
- **Vertical Movement**: Adjust focus depth when auto-focus is enabled

### Touch Interaction (Mobile/Tablet)
- **Touch and Drag**: Rotate the globe
- **Release**: Momentum continues naturally
- **Single Touch**: Supported for rotation

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Ctrl+D` | Toggle debug panel |
| `A` | Toggle auto-rotation |
| `P` | Switch between BokehPass/SimpleDOF modes |
| `T` | Toggle test objects (colored spheres) |
| `I` | Toggle lighting style (Stylized/Realistic) |
| `R` | Reset all parameters to defaults |
| `F` | Toggle auto-focus |
| `D` | Show DOF debug info in console |
| `S` | Log detailed state information |
| `L` | Toggle frame-by-frame logging |
| `1` | Focus on near object (red sphere) |
| `2` | Focus on Earth |
| `3` | Focus on far object (green sphere) |

### Debug Panel Parameters

#### Focus (Range: 2-20, Extended: 0-100)
- Distance from camera to focus plane
- Objects at this distance appear perfectly sharp
- Default: 8.0 (Earth's distance from camera)

#### Aperture (Range: 1-50, Extended: 0.1-100)
- Simulated camera f-stop value
- Lower values = larger aperture = more blur
- Higher values = smaller aperture = less blur
- Default: 5 (f/5)

#### Max Blur (Range: 0.001-0.1, Extended: 0-1)
- Maximum blur intensity for out-of-focus areas
- Higher values create stronger miniature effect
- Default: 0.02

#### Saturation (Range: 1-2, Extended: 0-3)
- Color saturation multiplier
- Values > 1 increase vibrancy
- Default: 1.4

### Manual Value Entry
- Click on any number input field in debug panel
- Type desired value (can exceed slider range)
- Press Enter to confirm
- Slider automatically syncs if value is within its range

## Interaction Behavior

### Globe Rotation
1. **Hover State**: Cursor changes to "grab" hand when over globe
2. **Dragging**: Cursor changes to "grabbing" hand during rotation
3. **Momentum**: Globe continues spinning after release with natural deceleration
4. **Auto-rotation Resume**: After globe stops, automatic rotation resumes in 1 second
5. **Sensitivity**: Adjustable via `CONFIG.animation.dragSensitivity`

### Physics Parameters (Enhanced)
- **Rotation Damping**: 0.985 (1.5% velocity reduction per frame - 3x longer momentum)
- **Drag Sensitivity**: 0.02 (rotation speed relative to mouse movement - 4x more responsive)
- **Momentum Threshold**: 0.0001 (when rotation stops completely)
- **Auto-rotation Speed**: 0.0003 radians/frame
- **Auto-rotation Resume**: 2 seconds after momentum stops
- **Acceleration Factor**: Up to 3x boost for fast swipes
- **Velocity Smoothing**: 0.8/0.2 blend for natural momentum
- **Wobble Effect**: Subtle vertical oscillation for realism

## DOF Modes Comparison

### BokehPass Mode
- Native Three.js implementation
- Physically accurate bokeh simulation
- Circular aperture shape
- Higher quality but more GPU intensive
- Best for powerful systems

### SimpleDOF Mode
- Custom tilt-shift implementation
- Horizontal blur bands for classic tilt-shift look
- Better performance on mid-range systems
- More stylized/artistic than realistic
- Recommended for most users

## Test Objects Guide

Enable test objects with the `T` key to visualize depth of field at different distances:

- **Red Sphere**: z=4, closest to camera
- **Yellow Sphere**: z=0, at Earth's depth
- **Green Sphere**: z=-5, behind Earth
- **Blue Sphere**: z=-10, furthest away

Use these reference objects to:
- Test DOF parameter changes
- Verify blur intensity at different depths
- Set focus points with number keys (1/2/3)

## Lighting Modes

### Stylized (Default)
Optimized for miniature diorama aesthetic:
- High ambient light (0.8) with blue tint (#4466aa)
- Hemisphere light for natural sky/ground gradient
- Multiple fill lights to eliminate harsh shadows
- Subtle blue fog for atmospheric perspective
- Soft shadows with blur
- Earth has slight emissive glow

### Realistic
More dramatic lighting with deeper shadows:
- Low ambient light (0.3) for higher contrast
- Reduced hemisphere light intensity
- Pure black fog for space effect
- Sharper, more defined shadows
- Single dominant light source

Toggle between modes with the `I` key when debug panel is open.

## Optimal Settings Guide

### Classic Miniature Diorama
```
Focus: 7-9 (slightly in front/behind Earth)
Aperture: 1-3 (strong blur)
Max Blur: 0.04-0.08
Saturation: 1.4-1.6
Mode: SimpleDOF
```

### Subtle Depth Effect
```
Focus: 8 (on Earth)
Aperture: 10-20 (moderate blur)
Max Blur: 0.01-0.02
Saturation: 1.2-1.3
Mode: BokehPass
```

### Extreme Tilt-Shift
```
Focus: 5-6 (very close)
Aperture: 0.5-1 (maximum blur)
Max Blur: 0.1-0.2 (use manual input)
Saturation: 1.8-2.0
Mode: SimpleDOF
```

## Technical Details

### Three.js r128 Compatibility
- Uses jsDelivr CDN for all dependencies
- Proper module loading order for post-processing
- BokehPass initialization adjusted for r128
- Custom aperture scaling (0.05/f-number)
- Manual aspect ratio updates on resize

### Performance Optimizations
- IcosahedronGeometry for smooth spheres (less vertices)
- Procedural texture generation (no external images)
- Efficient blur sampling algorithms
- Adaptive render quality based on device
- Minimal post-processing passes
- Momentum-based rotation (reduces continuous updates)

### Browser Requirements
- **Minimum**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Required Features**: WebGL 2.0, ES6 JavaScript
- **Recommended**: Dedicated GPU, 4GB+ RAM
- **Mobile**: Full support with touch interaction

## Troubleshooting

### Globe Not Rotating
**Symptoms**: Click and drag doesn't rotate the globe
**Solutions**:
1. Ensure you're clicking directly on the globe (not the background)
2. Check browser console for JavaScript errors
3. Verify Three.js loaded correctly
4. Try refreshing the page
5. Test with keyboard shortcut `A` to toggle auto-rotation

### Rotation Too Fast/Slow
**Symptoms**: Globe spins too quickly or slowly when dragged
**Solutions**:
1. Adjust `dragSensitivity` in CONFIG.animation
2. Check if frame rate is stable
3. Try different browser or device
4. Ensure no other heavy applications running

### CORS Errors / Geographic Data Not Loading
**Symptoms**: Console shows CORS policy errors, Earth appears without recognizable continents
**Solutions**:
1. Run a local HTTP server (see Installation section)
2. Let the fallback system load simplified data automatically
3. Host files on a web server
4. Use a browser extension to disable CORS (development only)

### DOF Effect Not Visible
**Symptoms**: No blur visible, everything appears sharp
**Solutions**:
1. Switch to SimpleDOF mode (press `P`)
2. Set Aperture to 1-2 for maximum effect
3. Increase Max Blur to 0.05 or higher (use manual input)
4. Enable test objects (`T`) to verify depth blur
5. Check that post-processing initialized (check console)

### Performance Issues
**Symptoms**: Low frame rate, stuttering animation or rotation
**Solutions**:
1. Switch to SimpleDOF mode (`P` key)
2. Reduce Max Blur value (try 0.01)
3. Lower browser window size
4. Close other GPU-intensive applications
5. Disable test objects if enabled (`T`)
6. Use Realistic lighting mode (`I`)
7. Disable auto-rotation (`A`) when not needed

### Black Screen or Loading Forever
**Symptoms**: Application stuck on loading screen
**Solutions**:
1. Check browser console for errors
2. Ensure all files are in correct locations
3. Verify Three.js CDN is accessible
4. Try a different browser
5. Clear browser cache and reload

### Touch Not Working on Mobile
**Symptoms**: Can't rotate globe on touch devices
**Solutions**:
1. Ensure using a modern mobile browser
2. Check that touch events aren't being blocked
3. Try with single finger only
4. Reload the page
5. Check console for touch event errors

## Development Guide

### Adding New Post-Processing Effects
1. Create shader in `postProcessing.js`
2. Add pass to composer chain
3. Create UI controls in `index.html`
4. Handle parameter updates in `app.js`

### Customizing Globe Interaction
1. Modify `GlobeInteractionController` class in `app.js`
2. Adjust physics parameters (damping, sensitivity)
3. Add new gesture recognizers
4. Implement additional visual feedback

### Customizing Geographic Data
1. Download different resolution from Natural Earth
2. Place in `data/` folder
3. Update path in `geoJsonLoader.js`
4. Adjust color scheme in `earthTextureGenerator.js`

### Performance Profiling
1. Enable frame logging (`L` key)
2. Use Chrome DevTools Performance tab
3. Monitor `composer.render()` time
4. Check texture generation duration
5. Profile interaction handlers

## Known Issues & Limitations

1. **BokehPass Saturation**: The saturation parameter doesn't affect BokehPass in r128 (Three.js limitation)
2. **Depth Texture**: Depth visualization not implemented (would require additional shader pass)
3. **Mobile Performance**: Significant performance variations across mobile devices
4. **CORS Restrictions**: Local file access blocked by browsers without server
5. **Memory Usage**: High-resolution textures (4096x2048) may cause issues on low-memory devices
6. **Multi-touch**: Only single-touch rotation is currently supported

## Future Enhancements

- [ ] Real emotion data visualization on continents
- [ ] Animated weather patterns
- [ ] City lights on night side
- [ ] Advanced gesture controls (pinch to zoom)
- [ ] Inertial scrolling for rotation
- [ ] WebGPU rendering support
- [ ] Additional post-processing effects (bloom, FXAA)
- [ ] Save/load parameter presets
- [ ] Screenshot/video export functionality
- [ ] Time-lapse day/night cycle
- [ ] Procedural cloud animation
- [ ] VR/AR support
- [ ] Multi-globe comparison view

## Credits & Resources

- **Three.js r128**: 3D rendering engine
- **Natural Earth**: Free vector and raster map data
- **Inspiration**: Tilt-shift photography techniques
- **Color Palette**: Miniature diorama photography reference
- **Interaction Design**: Physical globe and trackball interfaces

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch
3. Test thoroughly with different browsers
4. Ensure mobile compatibility
5. Update documentation as needed
6. Submit a pull request with clear description