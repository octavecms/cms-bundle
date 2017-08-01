<?php

namespace VideInfra\CMSBundle\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use VideInfra\CMSBundle\Factory\PageFactory;
use VideInfra\CMSBundle\PageType\CustomPageType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageFactoryTest extends WebTestCase
{
    /** @var PageFactory */
    private $pageFactory;

    public function setUp()
    {
        static::bootKernel();
        $container = static::$kernel->getContainer();

        $this->pageFactory = $container->get('vig.cms.page.factory');
    }

    public function testCreate()
    {
        $pageType = $this->pageFactory->create('custom');
        $this->assertTrue($pageType instanceof CustomPageType);
    }
}