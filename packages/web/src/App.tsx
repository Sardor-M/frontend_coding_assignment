import { RecoilRoot } from 'recoil';
import AppRouter from './router';

export default function App() {
    return (
        <RecoilRoot>
            <AppRouter />
        </RecoilRoot>
    );
}
