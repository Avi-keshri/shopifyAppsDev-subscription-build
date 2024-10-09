import {
  Page,
  Card,
  Layout,
  Text,
  BlockStack,
  EmptyState
  } from "@shopify/polaris";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";
import { TitleBar } from "@shopify/app-bridge-react";

  export async function loader({ request }) {
    const { billing, session } = await authenticate.admin(request);
    let { shop } = session;
    let myShop = shop.replace(".myshopify.com", "");
    
    try {
      // Attempt to check if the shop has an active payment for any plan
      const billingCheck = await billing.require({
        plans: [MONTHLY_PLAN, ANNUAL_PLAN],
        isTest: true,
        // Instead of redirecting on failure, just catch the error
        onFailure: () => {
          throw new Error('No active plan');
        }
      });
  
      // If the shop has an active subscription, log and return the details
      const subscription = billingCheck.appSubscriptions[0];
      console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
      return json({ billing, plan: subscription,myShop });
  
    } catch (error) {
      // If the shop does not have an active plan, return an empty plan object
      if (error.message === 'No active plan') {
        console.log('Shop does not have any active plans.');
        return json({ billing, plan: { name: "Free" } });

      }
      // If there is another error, rethrow it
      throw error;
    }
  }
  export default function DashboardPage() {
    const { plan,myShop } = useLoaderData();
    return (
      <Page>
        <TitleBar title="Dashboard Page" />
        <Layout>
          <Layout.Section>
            <Card>
              {plan.test ? (
                 <BlockStack gap="300">
                 <Text as="p" variant="bodyMd">
                   Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quis nam consequuntur suscipit dignissimos ab deserunt alias eum, omnis assumenda explicabo a libero minus delectus fugit quod animi veritatis praesentium necessitatibus?.
                 </Text>
               </BlockStack>
              ) : (
                <EmptyState
                  heading="Manage Subscription Plan"
                  action={{
                    content: 'choose your plan',
                    url: `https://admin.shopify.com/store/subscription-build/apps/subscription-build/app/pricing`,
                    external: "true",
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>You don't have any active plan</p>
                </EmptyState>
              )}

            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
  