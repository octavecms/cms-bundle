<?php

namespace VideInfra\CMSBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;
use VideInfra\CMSBundle\PageType\PageTypeInterface;
use VideInfra\CMSBundle\Service\PageManager;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageAdmin extends AbstractAdmin
{
    /** @var PageManager */
    private $pageManager;

    /** @var AuthorizationChecker */
    private $authorizationChecker;

    /**
     * @param PageManager $pageManager
     */
    public function setPageManager(PageManager $pageManager)
    {
        $this->pageManager = $pageManager;
    }

    /**
     * @param AuthorizationChecker $authorizationChecker
     */
    public function setAuthorizationChecker(AuthorizationChecker $authorizationChecker)
    {
        $this->authorizationChecker = $authorizationChecker;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('id', null, [
                'width' => 30
            ])
            ->add('title')
            ->add('active')
            ->add('path', null, [
                'template' => 'VideInfraCMSBundle:Page:list__path.html.twig'
            ])
            ->add('createdAt')
            ->add('updatedAt')
            ->add('_action', null, [
                'actions' => [
                    'edit' => [],
                ]
            ]);
    }

    /**
     * @param RouteCollection $collection
     */
    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->add('create_type', 'create/{type}', [
            '_controller' => 'VideInfraCMSBundle:PageAdmin:createPage'
        ]);
    }

    /**
     * @return array
     */
    public function getPageTypes()
    {
        $types = $this->pageManager->getTypes();
        $output = [];

        /** @var PageTypeInterface $type */
        foreach ($types as $type) {
            if ($this->authorizationChecker->isGranted($type->canCreateRole())) {
                $output[] = $type;
            }
        }

        return $output;
    }
}