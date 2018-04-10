<?php

namespace Octave\CMSBundle\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Octave\CMSBundle\Factory\PageTypeFactory;
use Octave\CMSBundle\Page\Type\CustomPageType;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class PageFactoryTest extends WebTestCase
{
    /** @var PageTypeFactory */
    private $pageFactory;

    public function setUp()
    {
        static::bootKernel();
        $container = static::$kernel->getContainer();

        $this->pageFactory = $container->get('octave.cms.page_type.factory');
    }

    public function testCreate()
    {
        $pageType = $this->pageFactory->get('custom');
        $this->assertTrue($pageType instanceof CustomPageType);
    }
}