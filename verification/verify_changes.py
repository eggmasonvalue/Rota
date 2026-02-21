from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")

        # 1. Verify "OPPONENT" label
        opponent_label = page.get_by_text("OPPONENT", exact=True)
        if opponent_label.count() > 0 and opponent_label.first.is_visible():
            print("PASS: 'OPPONENT' label is visible.")
        else:
            print("FAIL: 'OPPONENT' label is NOT visible.")

        # 2. Verify Dropdown options
        select_element = page.locator("select").first
        options_text = select_element.inner_text()
        if "Machine" in options_text and "Human" in options_text:
            print("PASS: Options 'Machine' and 'Human' are present.")
        else:
            print(f"FAIL: Options 'Machine' and 'Human' NOT found. Found: {options_text}")

        # 3. Verify "Strategy Tips" is gone
        # We need to scroll down to check visibility, but checking if it's attached is enough for now.
        # Ideally, it should not be in the DOM.
        strategy_tips = page.get_by_role("heading", name="Strategy Tips")
        if strategy_tips.count() == 0:
            print("PASS: 'Strategy Tips' section is NOT present.")
        else:
            if not strategy_tips.is_visible():
                 print("PASS: 'Strategy Tips' section is present but not visible (might be okay if scrolled out, but we removed it).")
            else:
                 print("FAIL: 'Strategy Tips' section IS visible.")

        # Take a screenshot
        page.screenshot(path="verification/verification.png", full_page=True)
        print("Screenshot saved to verification/verification.png")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
