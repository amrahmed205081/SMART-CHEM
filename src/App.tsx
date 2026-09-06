import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";

const About = lazy(() => import("./pages/About").then((m) => ({ default: m.About })));
const Products = lazy(() => import("./pages/Products").then((m) => ({ default: m.Products })));
const ProductCategory = lazy(() =>
  import("./pages/ProductCategory").then((m) => ({ default: m.ProductCategory })),
);
const ProductPartner = lazy(() =>
  import("./pages/ProductPartner").then((m) => ({ default: m.ProductPartner })),
);
const ProductFamily = lazy(() =>
  import("./pages/ProductFamily").then((m) => ({ default: m.ProductFamily })),
);
const ProductDetails = lazy(() =>
  import("./pages/ProductDetails").then((m) => ({ default: m.ProductDetails })),
);
const Partners = lazy(() => import("./pages/Partners").then((m) => ({ default: m.Partners })));
const PartnerDetails = lazy(() =>
  import("./pages/PartnerDetails").then((m) => ({ default: m.PartnerDetails })),
);
const Applications = lazy(() =>
  import("./pages/Applications").then((m) => ({ default: m.Applications })),
);
const Contact = lazy(() => import("./pages/Contact").then((m) => ({ default: m.Contact })));

function RouteFallback() {
  return <div className="min-h-[40vh] w-full bg-cream" aria-hidden="true" />;
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/category/:categoryId" element={<ProductCategory />} />
          <Route path="/products/category/:categoryId/:sourceId" element={<ProductPartner />} />
          <Route
            path="/products/category/:categoryId/:sourceId/:familyId"
            element={<ProductFamily />}
          />
          <Route path="/products/partner/:partnerId" element={<ProductPartner />} />
          <Route path="/products/partner/:partnerId/:familyId" element={<ProductFamily />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/partners/:id" element={<PartnerDetails />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
