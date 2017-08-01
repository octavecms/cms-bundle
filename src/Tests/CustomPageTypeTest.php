<?php

namespace VideInfra\CMSBundle\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use VideInfra\CMSBundle\Factory\PageFactory;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class CustomPageTypeTest extends WebTestCase
{
    /** @var PageFactory */
    private $pageFactory;

    public function setUp()
    {
        static::bootKernel();
        $container = static::$kernel->getContainer();

        $this->pageFactory = $container->get('vig.cms.page.factory');
    }

    public function testEditAction()
    {
        $pageType = $this->pageFactory->create('custom');
        $this->assertTrue($pageType->getName() == 'custom');
        $this->assertTrue(is_string($pageType->getController()));
    }
}