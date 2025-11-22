const path = require('path');
const webpack = require('webpack');

module.exports = {
  // Performance optimizations
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor chunk for third-party libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        // Common chunk for shared components
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
        // React chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        // Router chunk
        router: {
          test: /[\\/]node_modules[\\/]react-router-dom[\\/]/,
          name: 'router',
          chunks: 'all',
          priority: 15,
        },
      },
    },
    // Runtime chunk for webpack runtime
    runtimeChunk: {
      name: 'runtime',
    },
  },

  // Performance hints
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000, // 500kb
    maxAssetSize: 512000, // 500kb
  },

  // Resolve optimizations
  resolve: {
    // Add aliases for better tree shaking
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@config': path.resolve(__dirname, 'src/config'),
    },
    // Optimize module resolution
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },

  // Module rules for optimization
  module: {
    rules: [
      // JavaScript/JSX optimization
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { 
                targets: '> 0.25%, not dead',
                useBuiltIns: 'usage',
                corejs: 3
              }],
              ['@babel/preset-react', { runtime: 'automatic' }]
            ],
            plugins: [
              // Tree shaking for lodash
              ['lodash', { id: ['lodash'] }],
              // Remove console logs in production
              process.env.NODE_ENV === 'production' && 'transform-remove-console',
              // Dynamic imports
              '@babel/plugin-syntax-dynamic-import',
            ].filter(Boolean),
          },
        },
      },
      // CSS optimization
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'tailwindcss',
                  'autoprefixer',
                  // PurgeCSS for production
                  process.env.NODE_ENV === 'production' && [
                    '@fullhuman/postcss-purgecss',
                    {
                      content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
                      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
                    },
                  ],
                ].filter(Boolean),
              },
            },
          },
        ],
      },
      // Image optimization
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]',
        },
      },
    ],
  },

  // Plugins for optimization
  plugins: [
    // Define environment variables
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    
    // Provide plugin for common libraries
    new webpack.ProvidePlugin({
      React: 'react',
    }),

    // Bundle analyzer for production
    process.env.ANALYZE && new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
  ].filter(Boolean),

  // Development server optimization
  devServer: {
    compress: true,
    hot: true,
    historyApiFallback: true,
  },

  // Source maps for development
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
};