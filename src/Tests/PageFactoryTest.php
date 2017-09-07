<?php

namespace VideInfra\CMSBundle\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use VideInfra\CMSBundle\Factory\PageTypeFactory;
use VideInfra\CMSBundle\Page\Type\CustomPageType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageFactoryTest extends WebTestCase
{
    /** @var PageTypeFactory */
    private $pageFactory;

    public function setUp()
    {
        static::bootKernel();
        $container = static::$kernel->getContainer();

        $this->pageFactory = $container->get('vig.cms.page_type.factory');
    }

    public function testCreate()
    {
        $pageType = $this->pageFactory->get('custom');
        $this->assertTrue($pageType instanceof CustomPageType);
    }
}