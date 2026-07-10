export function GridBackground() {
    return (
        <div
            className="
                absolute inset-0
                bg-[linear-gradient(to_right,rgba(0,0,0,.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.1)_1px,transparent_1px)]
                bg-size-[80px_80px]
                mask-[radial-gradient(ellipse_at_center,black_55%,transparent_100%)]
            "
        />
    );
}
