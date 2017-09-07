<?php

namespace VideInfra\CMSBundle\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use VideInfra\CMSBundle\Factory\PageTypeFactory;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class CustomPageTypeTest extends WebTestCase
{
    /** @var PageTypeFactory */
    private $pageFactory;

    public function setUp()
    {
        static::bootKernel();
        $container = static::$kernel->getContainer();

        $this->pageFactory = $container->get('vig.cms.page_type.factory');
    }

    public function testEditAction()
    {
        $pageType = $this->pageFactory->get('custom');
        $this->assertTrue($pageType->getName() == 'custom');
        $this->assertTrue(is_string($pageType->getController()));
    }
}