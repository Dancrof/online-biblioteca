import { useState } from "react";

const textColorClasses: string[] = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark'
];

export const LoadingPage = () => {

    const [textColors, setTextColors] = useState<string[]>(textColorClasses);

    return (

        <main className="loading-page">
            <div className="loading-page__spinners d-flex justify-content-center align-items-center gap-3 flex-wrap p-4">
                {textColors.map((colorClass) => (
                    <div className={`spinner-grow text-${colorClass}`} role="status" key={colorClass}/>
                ))}
            </div>
            <div className="container-lg py-5 d-flex justify-content-center align-items-center">
                <span className="visually-hidden">Loading...</span>
            </div>
        </main>

    )
}
