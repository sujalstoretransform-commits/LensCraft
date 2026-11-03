import { authenticate } from "../shopify.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { createSavedPrescription, getSavedPrescriptions } from "../services/saved-prescription.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.public.appProxy(request);
  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");

  if (!session || !customerId) {
    return Response.json({ savedPrescriptions: [] });
  }

  const savedPrescriptions = await getSavedPrescriptions({
    shop: session.shop,
    customerId,
  });

  return Response.json({
    savedPrescriptions: savedPrescriptions.map((prescription) => ({
      ...prescription,
      rightSph: prescription.rightSph?.toString() ?? null,
      rightCyl: prescription.rightCyl?.toString() ?? null,
      leftSph: prescription.leftSph?.toString() ?? null,
      leftCyl: prescription.leftCyl?.toString() ?? null,
      pd: prescription.pd?.toString() ?? null,
    })),
  });
}


export async function action({ request }: ActionFunctionArgs) {
  try {
    const { session } = await authenticate.public.appProxy(request);

    if (!session) {
      return Response.json(
        { error: "Invalid Shopify session" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const customerId = url.searchParams.get("logged_in_customer_id");

    if (!customerId) {
      return Response.json(
        { error: "Customer must be logged in" },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (!body.name || !body.rightSph || !body.leftSph || !body.pd) {
      return Response.json(
        { error: "Name, right SPH, left SPH, and PD are required" },
        { status: 400 },
      );
    }

    const prescription = await createSavedPrescription({
      shop: session.shop,
      customerId,
      name: String(body.name),
      rightSph: body.rightSph ? String(body.rightSph) : null,
      rightCyl: body.rightCyl ? String(body.rightCyl) : null,
      rightAxis: body.rightAxis ? Number(body.rightAxis) : null,
      leftSph: body.leftSph ? String(body.leftSph) : null,
      leftCyl: body.leftCyl ? String(body.leftCyl) : null,
      leftAxis: body.leftAxis ? Number(body.leftAxis) : null,
      pd: body.pd ? String(body.pd) : null,
      prescribedAt: body.prescribedAt ? new Date(body.prescribedAt) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    });

    return Response.json(
      { success: true, prescription },
      { status: 201 },
    );
  } catch (error) {
    console.error("Save prescription failed:", error);

    return Response.json(
      { error: "Unable to save prescription" },
      { status: 500 },
    );
  }
}