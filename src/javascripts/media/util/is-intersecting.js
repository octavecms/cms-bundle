export default function isIntersecting (rectLt, rectRb, point) {
    return rectLt[0] < point[0] && rectLt[1] < point[1] && rectRb[0] > point[0] && rectRb[1] > point[1];
}