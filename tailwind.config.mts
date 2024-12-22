import withMT from '@material-tailwind/react/utils/withMT';

import type {Config} from 'tailwindcss';

export default withMT({
    content: [
        './example/**/*.html',
        './example/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
        },
    },
    plugins: [],
} satisfies Config);
